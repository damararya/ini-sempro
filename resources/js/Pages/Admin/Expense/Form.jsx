import { useForm, router } from '@inertiajs/react';
import React from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ExpenseForm({
    initialValues = {},
    submitLabel = 'Simpan',
    onSubmitRoute,
    method = 'post',
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        type: initialValues.type ?? 'sampah',
        label: initialValues.label ?? '',
        detail: initialValues.detail ?? '',
        amount: initialValues.amount ?? 0,
        spent_at: initialValues.spent_at ?? '',
        proof_ref: initialValues.proof_ref ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        if (method === 'put') {
            put(onSubmitRoute);
        } else {
            post(onSubmitRoute);
        }
    };

    const inputClass =
        'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]';

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <InputLabel htmlFor="type" value="Jenis Iuran" />
                    <select
                        id="type"
                        className={inputClass}
                        value={data.type}
                        onChange={(event) => setData('type', event.target.value)}
                    >
                        <option value="sampah" className="text-slate-900">
                            Sampah
                        </option>
                        <option value="ronda" className="text-slate-900">
                            Ronda
                        </option>
                    </select>
                    <InputError message={errors.type} className="text-xs text-rose-300" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="spent_at" value="Tanggal" />
                    <input
                        id="spent_at"
                        type="date"
                        className={inputClass}
                        value={data.spent_at ?? ''}
                        onChange={(event) => setData('spent_at', event.target.value)}
                    />
                    <InputError message={errors.spent_at} className="text-xs text-rose-300" />
                </div>
            </div>

            <div className="space-y-2">
                <InputLabel htmlFor="label" value="Kategori / Judul Pengeluaran" />
                <input
                    id="label"
                    className={inputClass}
                    type="text"
                    value={data.label}
                    onChange={(event) => setData('label', event.target.value)}
                    placeholder="Gaji Petugas, Uang Makan, Operasional, dsb"
                />
                <InputError message={errors.label} className="text-xs text-rose-300" />
            </div>

            <div className="space-y-2">
                <InputLabel htmlFor="detail" value="Rincian" />
                <textarea
                    id="detail"
                    className={`${inputClass} min-h-[110px]`}
                    value={data.detail}
                    onChange={(event) => setData('detail', event.target.value)}
                    placeholder="Rincian penggunaan dana"
                />
                <InputError message={errors.detail} className="text-xs text-rose-300" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <InputLabel htmlFor="amount" value="Jumlah (Rp)" />
                    <input
                        id="amount"
                        className={inputClass}
                        type="number"
                        min="0"
                        value={data.amount}
                        onChange={(event) => setData('amount', Number(event.target.value))}
                    />
                    <InputError message={errors.amount} className="text-xs text-rose-300" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="proof_ref" value="No. Bukti / Kwitansi (opsional)" />
                    <input
                        id="proof_ref"
                        className={inputClass}
                        type="text"
                        value={data.proof_ref}
                        onChange={(event) => setData('proof_ref', event.target.value)}
                        placeholder="No. kwitansi atau referensi lain"
                    />
                    <InputError message={errors.proof_ref} className="text-xs text-rose-300" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <PrimaryButton type="submit" disabled={processing}>
                    {submitLabel}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => router.visit(route('admin.expenses.index'))}>
                    Batal
                </SecondaryButton>
            </div>
        </form>
    );
}
