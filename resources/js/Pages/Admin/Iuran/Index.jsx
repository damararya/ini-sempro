import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';

const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function Index(props) {
    const { iurans, filters } = props;

    const [type, setType] = React.useState(filters?.type || '');
    const [paid, setPaid] = React.useState(filters?.paid ?? '');

    const applyFilters = () => {
        const params = {};
        if (type) params.type = type;
        if (paid !== '') params.paid = paid;
        router.get(route('admin.iurans.index'), params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setType('');
        setPaid('');
        router.get(route('admin.iurans.index'), {}, { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        if (confirm('Hapus iuran ini?')) {
            router.delete(route('admin.iurans.destroy', id), { preserveScroll: true });
        }
    };

    const badgeClasses = 'inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-white/70';
    const ghostButtonClass =
        'inline-flex items-center justify-center rounded-full border border-white/18 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:border-white/28 hover:bg-white/14';

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="badge-soft">Administrasi Iuran</span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Iuran</h2>
                        <p className="mt-1 text-sm text-white/60">Kelola pembayaran warga, pantau status dan akses bukti transfer dengan presisi.</p>
                    </div>
                    <Link href={route('admin.iurans.create')} className={ghostButtonClass}>
                        Buat Iuran
                    </Link>
                </div>
            }
        >
            <Head title="Iuran" />

            <div className="space-y-8">
                <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                    <Link href={route('admin.dashboard')} className="text-white/70 transition hover:text-white">
                        Admin
                    </Link>
                    <span className="text-white/30">/</span>
                    <span>Iuran</span>
                </nav>

                <section className="panel-muted px-6 py-6">
                    <div className="flex flex-wrap items-end gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Jenis</label>
                            <select
                                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]"
                                value={type}
                                onChange={(event) => setType(event.target.value)}
                            >
                                <option value="" className="text-slate-900">
                                    Semua
                                </option>
                                <option value="sampah" className="text-slate-900">
                                    Sampah
                                </option>
                                <option value="ronda" className="text-slate-900">
                                    Ronda
                                </option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Status</label>
                            <select
                                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]"
                                value={paid}
                                onChange={(event) => setPaid(event.target.value)}
                            >
                                <option value="" className="text-slate-900">
                                    Semua
                                </option>
                                <option value="1" className="text-slate-900">
                                    Sudah
                                </option>
                                <option value="0" className="text-slate-900">
                                    Belum
                                </option>
                            </select>
                        </div>
                        <div className="ml-auto flex flex-wrap gap-3">
                            <PrimaryButton type="button" onClick={applyFilters}>
                                Terapkan Filter
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={resetFilters}>
                                Reset
                            </SecondaryButton>
                        </div>
                    </div>
                </section>

                <section className="panel-muted px-6 py-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10 text-sm text-white/75">
                            <thead>
                                <tr className="text-xs uppercase tracking-[0.25em] text-white/40">
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Pengguna</th>
                                    <th className="px-4 py-3 text-left">Jenis</th>
                                    <th className="px-4 py-3 text-left">Nominal</th>
                                    <th className="px-4 py-3 text-left">Bukti</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Dibayar Pada</th>
                                    <th className="px-4 py-3 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {iurans.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/6">
                                        <td className="px-4 py-3">{item.id}</td>
                                        <td className="px-4 py-3">
                                            {item.user ? (
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-white">{item.user.name}</div>
                                                    <div className="text-xs text-white/50">{item.user.email}</div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 uppercase">{item.type}</td>
                                        <td className="px-4 py-3 font-semibold text-white">{formatIDR(item.amount)}</td>
                                        <td className="px-4 py-3">
                                            {item.proof_url ? (
                                                <a
                                                    href={route('admin.iurans.proof', item.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300 transition hover:text-sky-100"
                                                >
                                                    Lihat
                                                </a>
                                            ) : (
                                                <span className="text-white/40">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    item.paid ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60'
                                                }`}
                                            >
                                                {item.paid ? 'Sudah' : 'Belum'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.paid_at
                                                ? new Date(item.paid_at).toLocaleString('id-ID', {
                                                      dateStyle: 'medium',
                                                      timeStyle: 'short',
                                                  })
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Link href={route('admin.iurans.edit', item.id)} className={ghostButtonClass}>
                                                    Edit
                                                </Link>
                                                <DangerButton type="button" className="px-4 py-2" onClick={() => destroy(item.id)}>
                                                    Hapus
                                                </DangerButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {iurans.links?.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {iurans.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                                            link.active
                                                ? 'border-white/25 bg-white/15 text-white'
                                                : 'border-white/15 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/30"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

