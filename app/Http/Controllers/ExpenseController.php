<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    /**
     * Daftar pengeluaran dengan filter jenis.
     */
    public function index(Request $request)
    {
        $query = Expense::query();

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $expenses = $query->orderByDesc('spent_at')->orderByDesc('created_at')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Expense/Index', [
            'expenses' => $expenses,
            'filters' => [
                'type' => $type,
            ],
        ]);
    }

    /**
     * Form create.
     */
    public function create()
    {
        return Inertia::render('Admin/Expense/Create');
    }

    /**
     * Simpan pengeluaran baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:sampah,ronda'],
            'label' => ['required', 'string', 'max:255'],
            'detail' => ['nullable', 'string'],
            'amount' => ['required', 'integer', 'min:0'],
            'spent_at' => ['nullable', 'date'],
            'proof_ref' => ['nullable', 'string', 'max:255'],
        ]);

        Expense::create($data);

        return redirect()->route('admin.expenses.index')->with('message', 'Pengeluaran ditambahkan');
    }

    /**
     * Form edit.
     */
    public function edit(Expense $expense)
    {
        return Inertia::render('Admin/Expense/Edit', [
            'expense' => $expense,
        ]);
    }

    /**
     * Update data.
     */
    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'type' => ['required', 'in:sampah,ronda'],
            'label' => ['required', 'string', 'max:255'],
            'detail' => ['nullable', 'string'],
            'amount' => ['required', 'integer', 'min:0'],
            'spent_at' => ['nullable', 'date'],
            'proof_ref' => ['nullable', 'string', 'max:255'],
        ]);

        $expense->update($data);

        return redirect()->route('admin.expenses.index')->with('message', 'Pengeluaran diperbarui');
    }

    /**
     * Hapus data.
     */
    public function destroy(Expense $expense)
    {
        $expense->delete();

        return redirect()->back()->with('message', 'Pengeluaran dihapus');
    }
}
