<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\User;
use App\Models\Expense;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Throwable;

class IuranController extends Controller
{
    /**
     * Menampilkan daftar iuran untuk panel admin dengan opsi filter.
     */
    public function index(Request $request)
    {
        Iuran::expireStalePayments();

        $query = Iuran::query()->with('user');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }
        if (!is_null($request->query('paid'))) {
            $paid = filter_var($request->query('paid'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (!is_null($paid)) {
                $query->where('paid', $paid);
            }
        }

        $iurans = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Iuran/Index', [
            'iurans' => $iurans,
            'filters' => [
                'type' => $type,
                'paid' => $request->query('paid'),
            ],
            'fixedAmount' => Iuran::FIXED_AMOUNT,
        ]);
    }

    /**
     * Menampilkan formulir pembuatan iuran manual oleh admin.
     */
    public function create()
    {
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/Iuran/Create', [
            'users' => $users,
            'fixedAmount' => Iuran::FIXED_AMOUNT,
        ]);
    }

    /**
     * Menyimpan iuran baru dari input admin.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'type' => ['required', 'in:sampah,ronda'],
            'paid' => ['required', 'boolean'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $data['amount'] = Iuran::FIXED_AMOUNT;

        if ($data['paid'] && empty($data['paid_at'])) {
            $data['paid_at'] = now();
        }
        if (!$data['paid']) {
            $data['paid_at'] = null;
        }

        Iuran::create($data);

        return redirect()->route('admin.iurans.index')->with('message', 'Iuran created');
    }

    /**
     * Menampilkan formulir edit iuran.
     */
    public function edit(Iuran $iuran)
    {
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/Iuran/Edit', [
            'iuran' => $iuran->only(['id', 'user_id', 'type', 'amount', 'paid', 'paid_at']),
            'users' => $users,
            'fixedAmount' => Iuran::FIXED_AMOUNT,
        ]);
    }

    /**
     * Memperbarui data iuran yang sudah ada.
     */
    public function update(Request $request, Iuran $iuran)
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'type' => ['required', 'in:sampah,ronda'],
            'paid' => ['required', 'boolean'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $data['amount'] = Iuran::FIXED_AMOUNT;

        if ($data['paid'] && empty($data['paid_at'])) {
            $data['paid_at'] = now();
        }
        if (!$data['paid']) {
            $data['paid_at'] = null;
        }

        $iuran->update($data);

        return redirect()->route('admin.iurans.index')->with('message', 'Iuran updated');
    }

    /**
     * Menampilkan file bukti pembayaran yang diunggah.
     */
    public function proof(Iuran $iuran)
    {
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
     * Mengekspor laporan transparansi iuran ke PDF.
     */
    public function exportPdf(Request $request)
    {
        Iuran::expireStalePayments();

        $month = (int) ($request->query('month') ?? now()->month);
        $year = (int) ($request->query('year') ?? now()->year);

        if ($month < 1 || $month > 12) {
            $month = (int) now()->month;
        }
        if ($year < 2000) {
            $year = (int) now()->year;
        }

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = (clone $start)->endOfMonth();

        $base = Iuran::query()
            ->whereNotNull('paid_at')
            ->where('paid', true)
            ->whereBetween('paid_at', [$start, $end]);

        $summary = [
            'total' => (int) (clone $base)->sum('amount'),
            'count' => (int) (clone $base)->count(),
            'sampah_total' => (int) (clone $base)->where('type', 'sampah')->sum('amount'),
            'sampah_count' => (int) (clone $base)->where('type', 'sampah')->count(),
            'ronda_total' => (int) (clone $base)->where('type', 'ronda')->sum('amount'),
            'ronda_count' => (int) (clone $base)->where('type', 'ronda')->count(),
        ];

        $transactionsByType = [];
        foreach (['sampah', 'ronda'] as $typeKey) {
            $transactionsByType[$typeKey] = Iuran::query()
                ->with('user:id,name,email')
                ->whereNotNull('paid_at')
                ->where('paid', true)
                ->where('type', $typeKey)
                ->whereBetween('paid_at', [$start, $end])
                ->orderByDesc('paid_at')
                ->orderByDesc('updated_at')
                ->get()
                ->map(function (Iuran $iuran) {
                    return [
                        'date' => optional($iuran->paid_at)->format('d/m'),
                        'source' => $iuran->user?->name ?? 'Tidak diketahui',
                        'note' => $iuran->order_id ?: 'Manual',
                        'amount' => (int) $iuran->amount,
                        'proof_url' => $iuran->proof_url,
                    ];
                })
                ->all();
        }

        $expenses = Expense::query()
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('spent_at', [$start, $end])
                  ->orWhereNull('spent_at');
            })
            ->orderByDesc('spent_at')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('type')
            ->map(function ($group) {
                return $group->map(function (Expense $expense) {
                    return [
                        'label' => $expense->label,
                        'detail' => $expense->detail,
                        'amount' => (int) $expense->amount,
                        'proof_ref' => $expense->proof_ref,
                        'date' => optional($expense->spent_at)->format('d/m'),
                    ];
                })->all();
            })->toArray();

        // Fallback ke konfigurasi statis jika tidak ada data DB untuk jenis tertentu
        $fallbackExpenses = config('iuran_report.expenses', []);
        foreach (['sampah', 'ronda'] as $typeKey) {
            if (empty($expenses[$typeKey]) && !empty($fallbackExpenses[$typeKey])) {
                $expenses[$typeKey] = collect($fallbackExpenses[$typeKey])->map(function ($item) {
                    return [
                        'label' => $item['label'] ?? '-',
                        'detail' => $item['detail'] ?? 'Rincian penggunaan',
                        'amount' => (int) ($item['amount'] ?? 0),
                        'proof_ref' => $item['proof_ref'] ?? null,
                        'date' => $item['date'] ?? null,
                    ];
                })->all();
            }
        }

        $monthLabels = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        $periodLabel = sprintf('%s %d', $monthLabels[$month], $year);
        $filename = sprintf('transparansi-iuran-%d-%02d.pdf', $year, $month);

        try {
            $pdf = Pdf::loadView('reports.iuran-transparency', [
                'periodLabel' => $periodLabel,
                'periodStart' => $start,
                'periodEnd' => $end,
                'summary' => $summary,
                'expenses' => $expenses,
                'transactionsByType' => $transactionsByType,
                'generatedAt' => now(),
            ])
                ->setPaper('a4', 'portrait')
                ->setWarnings(false)
                ->setOptions([
                    'isRemoteEnabled' => true,
                    'isHtml5ParserEnabled' => true,
                ]);

            $output = $pdf->output();
            $outputLength = strlen($output);
            Log::info('Iuran transparency PDF generated', [
                'month' => $month,
                'year' => $year,
                'user_id' => $request->user()?->id,
                'length' => $outputLength,
            ]);

            // Simpan sementara agar header download standar, lalu hapus setelah dikirim.
            $tempPath = 'reports/' . Str::uuid() . '.pdf';
            $stored = Storage::disk('local')->put($tempPath, $output);
            Log::info('Iuran transparency PDF stored', [
                'path' => $tempPath,
                'stored' => $stored,
                'size' => $outputLength,
            ]);

            if (!$stored) {
                return response('Gagal menyimpan PDF transparansi.', 500);
            }

            return response()->download(
                Storage::disk('local')->path($tempPath),
                $filename,
                ['Content-Type' => 'application/pdf']
            )->deleteFileAfterSend(true);
        } catch (Throwable $e) {
            Log::error('Iuran transparency PDF failed', [
                'month' => $month,
                'year' => $year,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response('Gagal membuat PDF transparansi.', 500);
        }
    }

    /**
     * Mengekspor PDF status pembayaran seluruh warga.
     */
    public function exportWargaPdf(Request $request)
    {
        Iuran::expireStalePayments();

        $month = (int) ($request->query('month') ?? now()->month);
        $year = (int) ($request->query('year') ?? now()->year);

        if ($month < 1 || $month > 12) {
            $month = (int) now()->month;
        }
        if ($year < 2000) {
            $year = (int) now()->year;
        }

        // Periode yang dipilih (3, 6, atau 12 bulan).
        $period = (int) ($request->query('period') ?? 3);
        if (!in_array($period, [3, 6, 12])) {
            $period = 3;
        }

        // Hitung batas periode pembayaran berdasarkan jumlah bulan terpilih.
        $periodEnd = Carbon::create($year, $month, 1)->endOfMonth();
        $periodStart = (clone $periodEnd)->subMonthsNoOverflow($period - 1)->startOfMonth();

        // Ambil semua warga (non-admin) beserta status iuran pada periode ini.
        $warga = User::query()
            ->select('id', 'name', 'email', 'nik')
            ->where('is_admin', false)
            ->orderBy('name')
            ->get()
            ->map(function (User $user) use ($periodStart, $periodEnd) {
                $paidSampah = Iuran::query()
                    ->where('user_id', $user->id)
                    ->where('type', 'sampah')
                    ->where('paid', true)
                    ->whereNotNull('paid_at')
                    ->whereBetween('paid_at', [$periodStart, $periodEnd])
                    ->exists();

                $paidRonda = Iuran::query()
                    ->where('user_id', $user->id)
                    ->where('type', 'ronda')
                    ->where('paid', true)
                    ->whereNotNull('paid_at')
                    ->whereBetween('paid_at', [$periodStart, $periodEnd])
                    ->exists();

                return [
                    'name' => $user->name,
                    'nik' => $user->nik,
                    'paid_sampah' => $paidSampah,
                    'paid_ronda' => $paidRonda,
                ];
            });

        $totalWarga = $warga->count();
        $summary = [
            'total' => $totalWarga,
            'sampah_paid' => $warga->where('paid_sampah', true)->count(),
            'sampah_unpaid' => $warga->where('paid_sampah', false)->count(),
            'ronda_paid' => $warga->where('paid_ronda', true)->count(),
            'ronda_unpaid' => $warga->where('paid_ronda', false)->count(),
        ];

        $monthLabels = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $periodLabel = sprintf(
            '%s %d – %s %d',
            $monthLabels[$periodStart->month],
            $periodStart->year,
            $monthLabels[$periodEnd->month],
            $periodEnd->year
        );
        $filename = sprintf('status-pembayaran-warga-%d-%02d-%dbulan.pdf', $year, $month, $period);

        try {
            $pdf = Pdf::loadView('reports.warga-payment-status', [
                'periodLabel' => $periodLabel,
                'periodMonths' => $period,
                'warga' => $warga,
                'summary' => $summary,
                'generatedAt' => now(),
            ])
                ->setPaper('a4', 'portrait')
                ->setWarnings(false)
                ->setOptions([
                    'isRemoteEnabled' => true,
                    'isHtml5ParserEnabled' => true,
                ]);

            $output = $pdf->output();
            $outputLength = strlen($output);
            Log::info('Warga payment status PDF generated', [
                'month' => $month,
                'year' => $year,
                'period' => $period,
                'user_id' => $request->user()?->id,
                'length' => $outputLength,
            ]);

            $tempPath = 'reports/' . Str::uuid() . '.pdf';
            $stored = Storage::disk('local')->put($tempPath, $output);
            Log::info('Warga payment status PDF stored', [
                'path' => $tempPath,
                'stored' => $stored,
                'size' => $outputLength,
            ]);

            if (!$stored) {
                return response('Gagal menyimpan PDF status pembayaran.', 500);
            }

            return response()->download(
                Storage::disk('local')->path($tempPath),
                $filename,
                ['Content-Type' => 'application/pdf']
            )->deleteFileAfterSend(true);
        } catch (Throwable $e) {
            Log::error('Warga payment status PDF failed', [
                'month' => $month,
                'year' => $year,
                'period' => $period,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response('Gagal membuat PDF status pembayaran.', 500);
        }
    }

    /**
     * Menghapus data iuran.
     */
    public function destroy(Iuran $iuran)
    {
        $iuran->delete();

        return redirect()->back()->with('message', 'Iuran deleted');
    }
}
