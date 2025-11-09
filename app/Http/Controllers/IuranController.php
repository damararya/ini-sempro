<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\User;
use Illuminate\Http\Request;
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
     * Menghapus data iuran.
     */
    public function destroy(Iuran $iuran)
    {
        $iuran->delete();

        return redirect()->back()->with('message', 'Iuran deleted');
    }
}
