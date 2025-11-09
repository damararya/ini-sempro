<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    /**
     * Memetakan konfigurasi Midtrans dari file config.
     */
    private function configure(): void
    {
        \Midtrans\Config::$serverKey = (string) config('midtrans.server_key');
        \Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = (bool) config('midtrans.is_3ds');
    }

    /**
     * Callback ketika pengguna menyelesaikan proses pembayaran.
     */
    public function finish(Request $request)
    {
        // Status akhir tetap menunggu notifikasi server-to-server agar data akurat.
        return redirect()->route('dashboard')
            ->with('message', 'Terima kasih! Jika pembayaran berhasil, status akan terupdate segera.');
    }

    /**
     * Callback saat pengguna menutup pembayaran tanpa menyelesaikannya.
     */
    public function unfinish(Request $request)
    {
        return redirect()->route('dashboard')
            ->with('message', 'Pembayaran belum selesai. Anda dapat mencoba lagi nanti.');
    }

    /**
     * Callback ketika terjadi error dari sisi Midtrans/Snap.
     */
    public function error(Request $request)
    {
        return redirect()->route('dashboard')
            ->with('message', 'Terjadi kesalahan saat memproses pembayaran.');
    }

    /**
     * Endpoint notifikasi server-to-server dari Midtrans.
     */
    public function notification(Request $request)
    {
        $this->configure();

        try {
            $notif = new \Midtrans\Notification();
        } catch (\Throwable $e) {
            Log::error('Midtrans notif parse error', ['error' => $e->getMessage()]);
            return response()->json(['ok' => false], 400);
        }

        $orderId = (string) ($notif->order_id ?? '');
        $transaction = (string) ($notif->transaction_status ?? '');
        $fraud = (string) ($notif->fraud_status ?? '');
        $gross = (int) ($notif->gross_amount ?? 0);

        // Format order id: iuran-{type}-{userId}-{random}
        $parts = explode('-', $orderId);
        if (count($parts) < 4 || $parts[0] !== 'iuran') {
            Log::warning('Unknown order id format', ['order_id' => $orderId]);
            return response()->json(['ok' => true]);
        }

        $type = $parts[1];
        $userId = (int) $parts[2];

        if (!in_array($type, ['sampah', 'ronda'], true) || $userId <= 0) {
            Log::warning('Invalid order id parts', compact('orderId', 'type', 'userId'));
            return response()->json(['ok' => true]);
        }

        $isSuccess = false;
        if ($transaction === 'capture') {
            $isSuccess = $fraud === 'accept';
        } elseif ($transaction === 'settlement') {
            $isSuccess = true;
        } elseif (in_array($transaction, ['cancel', 'deny', 'expire'], true)) {
            $isSuccess = false;
        } elseif ($transaction === 'pending') {
            $isSuccess = false;
        }

        if ($isSuccess && $gross > 0) {
            try {
                Iuran::expireStalePayments();

                $fixedAmount = Iuran::FIXED_AMOUNT;
                if ($gross !== $fixedAmount) {
                    Log::warning('Midtrans gross amount differs from fixed amount', [
                        'order_id' => $orderId,
                        'gross' => $gross,
                        'expected' => $fixedAmount,
                    ]);
                }

                $iuran = Iuran::query()->where('order_id', $orderId)->first();

                if ($iuran) {
                    $iuran->update([
                        'amount' => $fixedAmount,
                        'paid' => true,
                        'paid_at' => now(),
                    ]);
                } else {
                    $start = now()->copy()->startOfMonth();
                    $end = now()->copy()->endOfMonth();

                    $existing = Iuran::query()
                        ->where('user_id', $userId)
                        ->where('type', $type)
                        ->whereBetween('paid_at', [$start, $end])
                        ->where('paid', true)
                        ->orderByDesc('paid_at')
                        ->first();

                    if ($existing) {
                        $existing->update([
                            'amount' => (int) $existing->amount + (int) $gross,
                            'paid' => true,
                            'paid_at' => now(),
                            'order_id' => $orderId,
                        ]);
                    } else {
                        Iuran::create([
                            'user_id' => $userId,
                            'type' => $type,
                            'amount' => (int) $gross,
                            'paid' => true,
                            'paid_at' => now(),
                            'order_id' => $orderId,
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                // Saat notifikasi ganda/ada error, cukup log agar bisa ditelusuri.
                Log::warning('Midtrans upsert iuran failed (maybe duplicate)', [
                    'error' => $e->getMessage(),
                    'order_id' => $orderId,
                ]);
            }
        }

        return response()->json(['ok' => true]);
    }
}
