<?php

namespace App\Http\Controllers;

use App\Models\Sempro;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemproController extends Controller
{
    /**
     * Halaman indeks dialihkan ke dashboard utama.
     */
    public function index()
    {
        return redirect()->route('dashboard');
    }

    /**
     * Menampilkan formulir pengajuan proposal seminar.
     */
    public function create()
    {
        return Inertia::render('Sempro/Create');
    }

    /**
     * Menyimpan data pengajuan yang dikirim user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', 'string', 'max:100'],
        ]);

        $sempro = new Sempro();
        $sempro->title = $validated['title'];
        $sempro->description = $validated['description'];
        $sempro->category = $validated['category'];
        // Simpan relasi penulis agar admin dapat menelusuri siapa pengusulnya.
        $sempro->author_id = optional(auth()->user())->id;
        $sempro->author = optional(auth()->user())->email;
        $sempro->save();

        return redirect()->back()->with('message', 'Sempro saved successfully.');
    }

    /**
     * Endpoint lain belum digunakan saat ini.
     */
    public function show(Sempro $sempro)
    {
        // Disengaja dikosongkan sampai kebutuhan detail muncul.
    }

    public function edit(Sempro $sempro)
    {
        // Disengaja dikosongkan sampai kebutuhan pengeditan muncul.
    }

    public function update(Request $request, Sempro $sempro)
    {
        // Disengaja dikosongkan sampai kebutuhan pembaruan muncul.
    }

    public function destroy(Sempro $sempro)
    {
        // Disengaja dikosongkan sampai mekanisme hapus disepakati.
    }
}
