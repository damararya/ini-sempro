<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserIuranController extends Controller
{
    /**
     * Menampilkan halaman pembayaran untuk jenis iuran tertentu.
     */
    public function create(Request $request, string $type)
    {
        abort_unless(in_array($type, ['sampah', 'ronda'], true), 404);

        // Pastikan status iuran lama yang melewati periode aktif ditandai ulang.
        Iuran::expireStalePayments();

        $user = $request->user();
        $fixedAmount = Iuran::FIXED_AMOUNT;
        $periodMonths = Iuran::PAYMENT_PERIOD_MONTHS;

        // Hitung rentang tanggal yang mewakili periode penagihan saat ini.
        $periodStart = now()->copy()->subMonthsNoOverflow(max(0, $periodMonths - 1))->startOfMonth();
        $periodEnd = now()->copy()->endOfMonth();
        $periodLabel = $periodMonths <= 1
            ? $periodEnd->translatedFormat('F Y')
            : sprintf('%s - %s', $periodStart->translatedFormat('F Y'), $periodEnd->translatedFormat('F Y'));

        // Total nominal yang sudah dibayar user untuk jenis iuran ini.
        $paidSum = (int) Iuran::query()
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->where('paid', true)
            ->sum('amount');

        $paidThisPeriod = $paidSum >= $fixedAmount;
        $remaining = max(0, $fixedAmount - $paidSum);

        // Siapkan enam riwayat pembayaran terakhir untuk ditampilkan di halaman.
        $lastPayments = Iuran::recentHistoryForUser($user, $type);

        // Cari entri iuran yang masih menunggu bukti atau pembayaran.
        $pendingCandidate = Iuran::query()
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->where(function ($q) {
                $q->where('paid', false)
                  ->orWhereNull('proof_path');
            })
            ->orderBy('paid')
            ->orderByDesc('paid_at')
            ->orderByDesc('updated_at')
            ->first();

        $pendingProof = null;
        if ($pendingCandidate) {
            $payload = $pendingCandidate->toHistoryPayload();
            $pendingProof = [
                'id' => $payload['id'],
                'paid_at' => $payload['paid_at'],
                'proof_url' => $payload['proof_url'],
                'paid' => $payload['paid'],
            ];
        }

        return Inertia::render('Payment/Pay', [
            'type' => $type,
            'fixedAmount' => $fixedAmount,
            'paidThisPeriod' => $paidThisPeriod,
            'paidSum' => $paidSum,
            'remaining' => $remaining,
            'periodLabel' => $periodLabel,
            'lastPayments' => $lastPayments,
            'paymentPeriodMonths' => $periodMonths,
            'pendingProof' => $pendingProof,
        ]);
    }

    /**
     * Membuat transaksi Snap Midtrans untuk pembayaran iuran.
     */
    public function store(Request $request, string $type)
    {
        abort_unless(in_array($type, ['sampah', 'ronda'], true), 404);

        Iuran::expireStalePayments();

        $user = $request->user();
        $fixedAmount = Iuran::FIXED_AMOUNT;
        $periodMonths = Iuran::PAYMENT_PERIOD_MONTHS;

        $periodStart = now()->copy()->subMonthsNoOverflow(max(0, $periodMonths - 1))->startOfMonth();
        $periodEnd = now()->copy()->endOfMonth();
        $itemPeriodLabel = $periodMonths <= 1
            ? $periodEnd->format('M Y')
            : sprintf('%s - %s', $periodStart->format('M Y'), $periodEnd->format('M Y'));

        $request->validate([
            'amount' => ['required', 'integer', 'min:1000'],
        ]);

        // Konfigurasi kredensial Midtrans setiap kali request diterima.
        \Midtrans\Config::$serverKey = (string) config('midtrans.server_key');
        \Midtrans\Config::$isProduction = (bool) config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = (bool) config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = (bool) config('midtrans.is_3ds');

        // order_id maximum 50 karakter: format {jenisCode}{userId}{bulanTahun}{random6} tanpa strip.
        $typeCode = $type === 'sampah' ? '1' : '2';
        $periodCode = $periodEnd->format('my');
        $orderId = sprintf('%s%s%s%s', $typeCode, $user->id, $periodCode, Str::random(6));
        $grossAmount = $fixedAmount;
        $itemName = 'Iuran ' . ucfirst($type) . ' ' . $itemPeriodLabel;

        // Catat draft iuran sebelum diarahkan ke gateway pembayaran.
        Iuran::updateOrCreate(
            ['order_id' => $orderId],
            [
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $grossAmount,
                'paid' => false,
                'paid_at' => null,
                'proof_path' => null,
            ]
        );

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'item_details' => [[
                'id' => 'iuran-' . $type,
                'price' => $grossAmount,
                'quantity' => 1,
                'name' => $itemName,
            ]],
            'callbacks' => [
                'finish' => route('midtrans.finish', ['type' => $type]),
            ],
        ];

        // Log konteks request (tanpa data sensitif) agar mudah ditelusuri saat debug.
        Log::info('Midtrans createTransaction request', [
            'order_id' => $orderId,
            'order_id_len' => strlen($orderId),
            'type' => $type,
            'user_id' => $user->id,
            'gross_amount' => $grossAmount,
            'is_production' => (bool) config('midtrans.is_production'),
        ]);

        try {
            $transaction = \Midtrans\Snap::createTransaction($params);
            $redirectUrl = $transaction->redirect_url ?? null;
            $token = $transaction->token ?? null;
            $tokenHint = $token ? substr($token, -6) : null;

            Log::info('Midtrans createTransaction response', [
                'order_id' => $orderId,
                'redirect_url' => $redirectUrl,
                'token_hint' => $tokenHint,
            ]);
            if (!$redirectUrl) {
                return back()->with('message', 'Gagal membuat transaksi Midtrans.');
            }
            // Inertia::location menginstruksikan browser berpindah ke halaman pembayaran Midtrans.
            return \Inertia\Inertia::location($redirectUrl);
        } catch (\Throwable $e) {
            Log::error('Midtrans createTransaction failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            Iuran::where('order_id', $orderId)->delete();

            return back()->with('message', 'Gagal menginisiasi pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Membuat pembayaran manual tanpa gateway.
     */
    public function storeManual(Request $request, string $type)
    {
        abort_unless(in_array($type, ['sampah', 'ronda'], true), 404);

        Iuran::expireStalePayments();

        $user = $request->user();
        $fixedAmount = Iuran::FIXED_AMOUNT;

        $pendingCandidate = Iuran::query()
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->where(function ($q) {
                $q->where('paid', false)
                  ->orWhereNull('proof_path');
            })
            ->orderBy('paid')
            ->orderByDesc('paid_at')
            ->orderByDesc('updated_at')
            ->first();

        if ($pendingCandidate) {
            return redirect()
                ->route('iuran.pay.create', ['type' => $type])
                ->with('message', 'Masih ada pembayaran yang menunggu bukti. Silakan unggah bukti terlebih dahulu.');
        }

        Iuran::create([
            'user_id' => $user->id,
            'type' => $type,
            'amount' => $fixedAmount,
            'paid' => false,
            'paid_at' => null,
            'proof_path' => null,
        ]);

        return redirect()
            ->route('iuran.pay.create', ['type' => $type])
            ->with('message', 'Pembayaran manual dibuat. Silakan unggah bukti transfer.');
    }

    /**
     * Menampilkan bukti pembayaran yang diunggah pengguna atau admin.
     */
    public function showProof(Request $request, Iuran $iuran)
    {
        $user = $request->user();

        abort_unless(
            $iuran->user_id === $user->id || $user->can('access-admin'),
            403
        );

        $disk = Storage::disk('public');
        $path = $iuran->proof_path;

        if (!$path || !$disk->exists($path)) {
            abort(404, 'Bukti pembayaran tidak ditemukan.');
        }

        try {
            $absolutePath = $disk->path($path);
            $mimeType = $disk->mimeType($path) ?? 'application/octet-stream';
            $filename = basename($path);

            return response()->file($absolutePath, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\RuntimeException $exception) {
            return $disk->response($path);
        }
    }

    /**
     * Menghasilkan invoice PDF untuk pembayaran iuran pengguna.
     */
    public function invoice(Request $request, Iuran $iuran)
    {
        $user = $request->user();

        abort_unless(
            $iuran->user_id === $user->id || $user->can('access-admin'),
            403
        );

        $iuran->loadMissing('user');

        $periodMonths = Iuran::PAYMENT_PERIOD_MONTHS;
        $baseDate = $iuran->paid_at ?? $iuran->created_at ?? now();
        $periodStart = (clone $baseDate)->subMonthsNoOverflow(max(0, $periodMonths - 1))->startOfMonth();
        $periodEnd = (clone $baseDate)->endOfMonth();
        $periodLabel = $periodMonths <= 1
            ? $periodEnd->translatedFormat('F Y')
            : sprintf('%s - %s', $periodStart->translatedFormat('F Y'), $periodEnd->translatedFormat('F Y'));

        $filename = sprintf('invoice-iuran-%s-%s.pdf', $iuran->type, $iuran->id);

        $pdf = Pdf::loadView('reports.iuran-invoice', [
            'iuran' => $iuran,
            'user' => $iuran->user,
            'periodLabel' => $periodLabel,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        $output = $pdf->output();
        $outputLength = strlen($output);
        Log::info('Iuran invoice PDF generated', [
            'iuran_id' => $iuran->id,
            'user_id' => $request->user()?->id,
            'length' => $outputLength,
        ]);

        return response($output, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Menyimpan bukti transfer yang diunggah warga.
     */
    public function storeProof(Request $request, Iuran $iuran)
    {
        $user = $request->user();
        abort_unless($iuran->user_id === $user->id, 403);

        $data = $request->validate([
            'proof' => ['required', 'image', 'max:5120'],
        ]);

        if ($iuran->proof_path) {
            Storage::disk('public')->delete($iuran->proof_path);
        }

        // Simpan file bukti di disk publik lalu tandai iuran sebagai lunas.
        $path = $request->file('proof')->store('payment-proofs', 'public');
        $iuran->update([
            'proof_path' => $path,
            'paid' => true,
            'paid_at' => $iuran->paid_at ?? now(),
        ]);

        return back()->with('message', 'Bukti transfer berhasil diunggah.');
    }
}
