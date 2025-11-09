<?php
// Membuka tag PHP agar file dapat dieksekusi sebagai script

namespace App\Http\Middleware;
// Menentukan namespace middleware agar terorganisir dalam App\Http\Middleware

use Illuminate\Http\Request;
// Mengimpor kelas Request untuk menangani permintaan HTTP
use Inertia\Middleware;
// Mengimpor middleware dasar Inertia yang akan diwarisi
use Tightenco\Ziggy\Ziggy;
// Mengimpor Ziggy untuk menyediakan data routing ke frontend


class HandleInertiaRequests extends Middleware
// Mendeklarasikan middleware khusus yang memperluas Middleware Inertia
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';
    // Menentukan view utama yang akan dipakai saat permintaan pertama

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    // Mendefinisikan method untuk menentukan versi aset Inertia
    {
        return parent::version($request);
        // Menggunakan logika versi bawaan dari kelas induk
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    // Mendefinisikan data bersama yang otomatis dikirim ke setiap respon Inertia
    {
        return array_merge(parent::share($request), [
        // Menggabungkan data bawaan dengan data tambahan khusus aplikasi
            'auth' => [
                // Bagian yang berisi informasi autentikasi pengguna
                'user' => $request->user(), // Mengirim data pengguna yang sedang login (atau null jika guest)
            ],
            'flash' => [
                // Bagian yang membawa pesan flash dari session
                'message' => fn () => $request->session()->get('message') // Mengambil pesan flash bila tersedia
            ],
            'ziggy' => function () use ($request) {
                // Closure untuk mengirim konfigurasi Ziggy ke frontend
                return array_merge((new Ziggy)->toArray(), [
                    // Menggabungkan data rute Ziggy bawaan dengan informasi tambahan
                    'location' => $request->url(), // Menyertakan URL saat ini untuk kebutuhan Ziggy
                ]);
            },
        ]);
        // Mengembalikan array gabungan sebagai props bersama
    }
}
// Menutup definisi kelas HandleInertiaRequests
