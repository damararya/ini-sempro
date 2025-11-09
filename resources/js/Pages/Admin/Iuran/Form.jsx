import { useForm, router } from '@inertiajs/react';
import React from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function IuranForm({
    users,
    fixedAmount = 120000,
    initialValues = {},
    submitLabel = 'Simpan',
    onSubmitRoute,
    method = 'post',
}) {
    const enforcedAmount = typeof fixedAmount === 'number' ? fixedAmount : 120000;
    const { data, setData, post, put, processing, errors } = useForm({
        user_id: initialValues.user_id ?? '',
        type: initialValues.type ?? 'sampah',
        amount: initialValues.amount ?? enforcedAmount,
        paid: initialValues.paid ?? false,
        paid_at: initialValues.paid_at ?? '',
    });

    React.useEffect(() => {
        setData('amount', enforcedAmount);
    }, [enforcedAmount, setData]);

    const submit = (event) => {
        event.preventDefault();
        if (method === 'put') {
            put(onSubmitRoute);
        } else {
            post(onSubmitRoute);
        }
    };

    const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

    const selectClass =
        'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]';

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <InputLabel htmlFor="user_id" value="Pengguna (opsional)" />
                    <select
                        id="user_id"
                        className={selectClass}
                        value={data.user_id}
                        onChange={(event) => setData('user_id', event.target.value || '')}
                    >
                        <option value="" className="text-slate-900">
                            Tidak memilih
                        </option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id} className="text-slate-900">
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.user_id} className="text-xs text-rose-300" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="type" value="Jenis Iuran" />
                    <select
                        id="type"
                        className={selectClass}
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
                    <InputLabel htmlFor="amount" value="Nominal (tetap)" />
                    <input
                        id="amount"
                        className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 shadow-inner shadow-black/20"
                        type="text"
                        value={formatIDR(enforcedAmount)}
                        readOnly
                        disabled
                    />
                    <p className="text-xs text-white/50">Nominal iuran dikunci pada {formatIDR(enforcedAmount)}.</p>
                    <InputError message={errors.amount} className="text-xs text-rose-300" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="paid" value="Status" />
                    <select
                        id="paid"
                        className={selectClass}
                        value={data.paid ? '1' : '0'}
                        onChange={(event) => setData('paid', event.target.value === '1')}
                    >
                        <option value="0" className="text-slate-900">
                            Belum Bayar
                        </option>
                        <option value="1" className="text-slate-900">
                            Sudah Bayar
                        </option>
                    </select>
                    <InputError message={errors.paid} className="text-xs text-rose-300" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                    <InputLabel htmlFor="paid_at" value="Tanggal Bayar" />
                    <input
                        id="paid_at"
                        className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]"
                        type="datetime-local"
                        value={data.paid_at ?? ''}
                        onChange={(event) => setData('paid_at', event.target.value)}
                    />
                    <p className="text-xs text-white/50">Kosongkan untuk otomatis diisi sekarang ketika status Sudah Bayar.</p>
                    <InputError message={errors.paid_at} className="text-xs text-rose-300" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <PrimaryButton type="submit" disabled={processing}>
                    {submitLabel}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => router.visit(route('admin.iurans.index'))}>
                    Batal
                </SecondaryButton>
            </div>
        </form>
    );
}
