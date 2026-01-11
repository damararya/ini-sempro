<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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

        $pdf = Pdf::loadView('reports.iuran-transparency', [
            'periodLabel' => $periodLabel,
            'periodStart' => $start,
            'periodEnd' => $end,
            'summary' => $summary,
            'expenses' => config('iuran_report.expenses', []),
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        $output = $pdf->output();
        $outputLength = strlen($output);
        Log::info('Iuran transparency PDF generated', [
            'month' => $month,
            'year' => $year,
            'user_id' => $request->user()?->id,
            'length' => $outputLength,
        ]);

        return response($output, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
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
