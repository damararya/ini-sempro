<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Dashboard admin dengan statistik bulanan dan tren enam bulan.
     */
    public function __invoke(Request $request)
    {
        Iuran::expireStalePayments();

        $month = (int) ($request->query('month') ?? now()->month);
        $year = (int) ($request->query('year') ?? now()->year);

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = (clone $start)->endOfMonth();

        $base = Iuran::query()
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end]);

        $totalKeseluruhan = (int) (clone $base)->sum('amount');
        $totalSampah = (int) (clone $base)->where('type', 'sampah')->sum('amount');
        $totalRonda = (int) (clone $base)->where('type', 'ronda')->sum('amount');
        // Keluarga dihitung dari user yang telah login minimal sekali.
        $totalKeluarga = (int) User::query()->whereNotNull('last_login_at')->count();

        // Kumpulkan tren enam bulan terakhir termasuk bulan terpilih.
        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $s = (clone $start)->copy()->subMonths($i)->startOfMonth();
            $e = (clone $s)->endOfMonth();
            $label = $s->format('M Y');
            $q = Iuran::query()
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [$s, $e]);
            $trend[] = [
                'label' => $label,
                'keseluruhan' => (int) (clone $q)->sum('amount'),
                'sampah' => (int) (clone $q)->where('type', 'sampah')->sum('amount'),
                'ronda' => (int) (clone $q)->where('type', 'ronda')->sum('amount'),
            ];
        }

        $families = User::query()
            ->select('id', 'name', 'email', 'nik', 'created_at', 'last_login_at')
            ->where('is_admin', false)
            ->withCount([
                'iurans as active_paid_iuran_count' => fn ($query) => $query->where('paid', true),
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nik' => $user->nik,
                'registered_at' => optional($user->created_at)->toIso8601String(),
                'last_login_at' => optional($user->last_login_at)->toIso8601String(),
                'has_paid_dues' => ($user->active_paid_iuran_count ?? 0) > 0,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
            'stats' => [
                'totalKeseluruhan' => $totalKeseluruhan,
                'totalKeluarga' => $totalKeluarga,
                'totalSampah' => $totalSampah,
                'totalRonda' => $totalRonda,
            ],
            'trend' => $trend,
            'meta' => [
                'fixedAmount' => Iuran::FIXED_AMOUNT,
                'paymentPeriodMonths' => Iuran::PAYMENT_PERIOD_MONTHS,
            ],
            'families' => $families,
        ]);
    }
}
