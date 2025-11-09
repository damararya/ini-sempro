<?php // Membuka blok PHP agar file dikenali sebagai skrip PHP.

namespace App\Http\Controllers; // Menentukan namespace controller berada di App\Http\Controllers.

use App\Models\Iuran; // Mengimpor model Iuran untuk kebutuhan query pembayaran.
use App\Models\User; // Mengimpor model User guna menghitung statistik warga.
use Carbon\Carbon; // Mengimpor Carbon untuk manipulasi tanggal periode berjalan.
use Illuminate\Http\Request; // Mengimpor Request untuk mengambil data pengguna yang terautentikasi.
use Inertia\Inertia; // Mengimpor facade Inertia untuk merender halaman front-end.

class DashboardController extends Controller // Mendefinisikan kelas controller untuk halaman dashboard warga.
{
    /**
     * Menyusun data ringkas untuk dashboard warga.
     */
    public function index(Request $request) // Metode utama yang menangani permintaan halaman dashboard.
    {
        Iuran::expireStalePayments(); // Menandai iuran lama yang sudah melewati periode agar statusnya konsisten.

        $target = (int) env('DASHBOARD_MONTHLY_TARGET', 5_000_000); // Mengambil target pemasukan bulanan dari konfigurasi.

        $now = Carbon::now(); // Menangkap waktu saat ini sebagai referensi perhitungan periode.
        $start = $now->copy()->startOfMonth(); // Menentukan awal bulan berjalan.
        $end = $now->copy()->endOfMonth(); // Menentukan akhir bulan berjalan.

        $familiesCount = (int) User::query() // Menginisiasi query untuk menghitung keluarga aktif.
            ->whereNotNull('last_login_at') // Menyaring pengguna yang pernah login.
            ->count(); // Menghitung total keluarga yang memenuhi kriteria.

        $collected = (int) Iuran::query() // Membentuk query untuk total pemasukan bulan berjalan.
            ->whereNotNull('paid_at') // Mengambil hanya pembayaran yang telah memiliki tanggal bayar.
            ->whereBetween('paid_at', [$start, $end]) // Membatasi pencarian pada periode bulan berjalan.
            ->sum('amount'); // Menjumlahkan nominal pembayaran yang lolos filter.

        $user = $request->user(); // Mengambil data pengguna yang sedang login.
        $trashPaid = false; // Menginisialisasi status pembayaran iuran sampah.
        $rondaPaid = false; // Menginisialisasi status pembayaran iuran ronda.
        $userHistory = []; // Menyiapkan kontainer riwayat pembayaran milik pengguna.
        $adminHistory = []; // Menyiapkan kontainer riwayat pembayaran versi admin.

        if ($user) { // Mengeksekusi blok ini hanya bila ada pengguna yang login.
            $paidTypes = Iuran::query() // Membuat query status pembayaran per jenis.
                ->where('user_id', $user->id) // Membatasi ke pembayaran milik pengguna saat ini.
                ->where('paid', true) // Hanya mempertimbangkan pembayaran yang sudah lunas.
                ->whereIn('type', ['sampah', 'ronda']) // Memeriksa dua jenis iuran utama.
                ->pluck('type') // Mengambil daftar jenis yang sudah dibayar.
                ->all(); // Mengubah hasil pluck menjadi array biasa.

            $trashPaid = in_array('sampah', $paidTypes, true); // Menandai status iuran sampah dari daftar.
            $rondaPaid = in_array('ronda', $paidTypes, true); // Menandai status iuran ronda dari daftar.

            $userHistory = Iuran::recentHistoryForUser($user); // Mengambil riwayat terbaru milik pengguna dengan format seragam.

            if ($user->can('access-admin')) { // Menambahkan data ekstra bila pengguna memiliki hak admin.
                $adminHistory = Iuran::recentHistoryForAdmin(); // Mengambil riwayat pembayaran terbaru untuk panel admin.
            } // Menutup blok pengecekan hak admin.
        } // Menutup blok kondisi pengguna login.

        return Inertia::render('Dashboard', [ // Merender halaman dashboard melalui Inertia.
            'dashboard' => [ // Mengirimkan data utama dashboard ke frontend.
                'collected' => $collected, // Total pemasukan bulan berjalan.
                'target' => $target, // Target pemasukan bulan berjalan.
                'familiesCount' => $familiesCount, // Jumlah keluarga aktif.
                'trashPaid' => $trashPaid, // Status pembayaran iuran sampah pengguna.
                'rondaPaid' => $rondaPaid, // Status pembayaran iuran ronda pengguna.
                'paymentPeriodMonths' => Iuran::PAYMENT_PERIOD_MONTHS, // Lama satu periode pembayaran.
                'fixedAmount' => Iuran::FIXED_AMOUNT, // Nominal tetap iuran per periode.
                'history' => [ // Paket riwayat pembayaran yang tersinkron.
                    'user' => $userHistory, // Riwayat pembayaran milik pengguna saat ini.
                    'admin' => $adminHistory, // Riwayat pembayaran global untuk admin.
                ], // Menutup paket riwayat.
            ], // Menutup array data dashboard.
        ]); // Mengakhiri respons Inertia.
    } // Menutup metode index.
} // Menutup kelas DashboardController.
