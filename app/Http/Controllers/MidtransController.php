<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
    public function finish(Request $request, ?string $type = null)
    {
        $type = in_array($type, ['sampah', 'ronda'], true)
            ? $type
            : 'sampah';

        // Status akhir tetap menunggu notifikasi server-to-server agar data akurat.
        return redirect()->route('iuran.pay.create', ['type' => $type])
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

        // Format order id: {jenisCode}{userId}{bulanTahun}{random6} (baru),
        // iuran-{type}-{userId}-{random6} (transisi), atau iuran-{type}-(slug-nama)-{random} (lama).
        $matches = [];
        $type = '';
        $userIdFromOrder = null;
        $nameSlug = null;
        if (preg_match('/^(?P<typeCode>[12])(?P<userId>\d+)(?P<period>\d{4})(?P<token>[A-Za-z0-9]{6})$/', $orderId, $matches)) {
            $type = ($matches['typeCode'] ?? '') === '1' ? 'sampah' : 'ronda';
            $userIdFromOrder = (int) ($matches['userId'] ?? 0);
        } elseif (preg_match('/^iuran-(?P<type>[a-z]+)-(?P<userId>\d+)-(?P<token>[A-Za-z0-9]{6})$/i', $orderId, $matches)) {
            $type = strtolower($matches['type'] ?? '');
            $userIdFromOrder = (int) ($matches['userId'] ?? 0);
        } elseif (preg_match('/^iuran-(?P<type>[a-z]+)-\((?P<slug>[a-z0-9-]+)\)-(?P<token>[A-Za-z0-9]+)$/i', $orderId, $matches)) {
            $type = strtolower($matches['type'] ?? '');
            $nameSlug = Str::of($matches['slug'] ?? '')->lower()->value();
        } else {
            Log::warning('Unknown order id format', ['order_id' => $orderId]);
            return response()->json(['ok' => true]);
        }

        if (!in_array($type, ['sampah', 'ronda'], true)) {
            Log::warning('Invalid order id parts', [
                'orderId' => $orderId,
                'type' => $type,
                'userId' => $userIdFromOrder,
                'nameSlug' => $nameSlug,
            ]);
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
                $userId = $iuran?->user_id ?? $userIdFromOrder;

                if (!$userId && $nameSlug) {
                    $userId = optional(
                        User::query()
                            ->get()
                            ->first(fn (User $user) => Str::slug((string) $user->name, '-') === $nameSlug)
                    )->id;
                }

                if ($iuran) {
                    $iuran->update([
                        'amount' => $fixedAmount,
                        'paid' => true,
                        'paid_at' => now(),
                    ]);
                } elseif ($userId) {
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
                } else {
                    Log::warning('Midtrans notification without matching user record', [
                        'order_id' => $orderId,
                        'slug' => $nameSlug,
                    ]);
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
