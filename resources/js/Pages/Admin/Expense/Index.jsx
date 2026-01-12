import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';

const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function Index(props) {
    const { expenses, filters } = props;
    const [type, setType] = React.useState(filters?.type || '');

    const applyFilters = () => {
        const params = {};
        if (type) params.type = type;
        router.get(route('admin.expenses.index'), params, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setType('');
        router.get(route('admin.expenses.index'), {}, { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        if (confirm('Hapus pengeluaran ini?')) {
            router.delete(route('admin.expenses.destroy', id), { preserveScroll: true });
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
                        <span className="badge-soft">Transparansi Pengeluaran</span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Pengeluaran</h2>
                        <p className="mt-1 text-sm text-white/60">Catat pengeluaran agar tercetak di laporan PDF transparansi.</p>
                    </div>
                    <Link href={route('admin.expenses.create')} className={ghostButtonClass}>
                        Tambah Pengeluaran
                    </Link>
                </div>
            }
        >
            <Head title="Pengeluaran" />

            <div className="space-y-8">
                <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                    <Link href={route('admin.dashboard')} className="text-white/70 transition hover:text-white">
                        Admin
                    </Link>
                    <span className="text-white/30">/</span>
                    <span>Pengeluaran</span>
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
                                    <th className="px-4 py-3 text-left">Tanggal</th>
                                    <th className="px-4 py-3 text-left">Jenis</th>
                                    <th className="px-4 py-3 text-left">Kategori</th>
                                    <th className="px-4 py-3 text-left">Rincian</th>
                                    <th className="px-4 py-3 text-left">Bukti</th>
                                    <th className="px-4 py-3 text-left">Jumlah</th>
                                    <th className="px-4 py-3 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/6">
                                        <td className="px-4 py-3">{item.spent_at || '-'}</td>
                                        <td className="px-4 py-3 uppercase">{item.type}</td>
                                        <td className="px-4 py-3 font-semibold text-white">{item.label}</td>
                                        <td className="px-4 py-3 text-white/70">{item.detail || '-'}</td>
                                        <td className="px-4 py-3 text-white/60">{item.proof_ref || '-'}</td>
                                        <td className="px-4 py-3 font-semibold text-white">{formatIDR(item.amount)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Link href={route('admin.expenses.edit', item.id)} className={ghostButtonClass}>
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

                    {expenses.links?.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {expenses.links.map((link, index) =>
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
