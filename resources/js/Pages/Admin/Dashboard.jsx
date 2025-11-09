import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BanknotesIcon, UsersIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value ?? 0);

const formatDateTime = (value) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const StatCard = ({ label, value, icon: Icon, toneClass, accent }) => (
    <article className="panel-muted relative overflow-hidden px-6 py-6">
        <div className={`pointer-events-none absolute -top-20 right-0 h-36 w-36 rounded-full ${accent} blur-3xl`} />
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.25em] text-white/50">{label}</span>
                {Icon && (
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ${toneClass}`}>
                        <Icon className="h-6 w-6" />
                    </span>
                )}
            </div>
            <span className="text-3xl font-semibold text-white">{value}</span>
        </div>
    </article>
);

export default function AdminDashboard(props) {
    const { stats, filters, trend, families = [] } = props;
    const collected = stats?.totalKeseluruhan ?? 0;
    const totalKeluarga = stats?.totalKeluarga ?? 0;
    const totalSampah = stats?.totalSampah ?? 0;
    const totalRonda = stats?.totalRonda ?? 0;
    const month = filters?.month ?? new Date().getMonth() + 1;
    const year = filters?.year ?? new Date().getFullYear();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const yearOptions = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index);

    const onChange = (event) => {
        const params = new URLSearchParams(window.location.search);
        params.set(event.target.name, event.target.value);
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="badge-soft">Admin Center</span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Dasbor Admin</h2>
                        <p className="mt-2 text-sm text-white/60">
                            Ringkasan keuangan dan data warga untuk pengelolaan lingkungan yang elegan dan tertata.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-white/60">
                        <div className="text-white/80">{formatCurrency(collected)}</div>
                        <div className="mt-1 text-white/50">Total iuran tahun berjalan</div>
                    </div>
                </div>
            }
        >
            <Head title="Dasbor Admin" />

            <div className="space-y-8">
                <section className="panel-muted flex flex-wrap items-center justify-between gap-4 px-6 py-6">
                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <span className="text-xs uppercase tracking-[0.25em] text-white/40">Bulan</span>
                        <select
                            name="month"
                            value={month}
                            onChange={onChange}
                            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]"
                        >
                            {months.map((label, index) => (
                                <option key={index + 1} value={index + 1} className="text-slate-900">
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-3 text-sm text-white/70">
                        <span className="text-xs uppercase tracking-[0.25em] text-white/40">Tahun</span>
                        <select
                            name="year"
                            value={year}
                            onChange={onChange}
                            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-inner shadow-black/20 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]"
                        >
                            {yearOptions.map((optionYear) => (
                                <option key={optionYear} value={optionYear} className="text-slate-900">
                                    {optionYear}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Link
                        href={route('admin.iurans.index')}
                        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 transition hover:border-white/30 hover:bg-white/16"
                    >
                        Kelola Iuran
                    </Link>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <StatCard
                        label="Total Iuran Keseluruhan"
                        value={formatCurrency(collected)}
                        icon={BanknotesIcon}
                        toneClass="text-emerald-200"
                        accent="bg-[radial-gradient(circle,rgba(34,197,94,0.22),transparent_60%)]"
                    />
                    <StatCard
                        label="Total Data Keluarga"
                        value={totalKeluarga}
                        icon={UsersIcon}
                        toneClass="text-amber-200"
                        accent="bg-[radial-gradient(circle,rgba(250,204,21,0.24),transparent_60%)]"
                    />
                    <StatCard
                        label="Total Iuran Sampah"
                        value={formatCurrency(totalSampah)}
                        icon={TrashIcon}
                        toneClass="text-sky-200"
                        accent="bg-[radial-gradient(circle,rgba(56,189,248,0.24),transparent_60%)]"
                    />
                    <StatCard
                        label="Total Iuran Ronda"
                        value={formatCurrency(totalRonda)}
                        icon={ShieldCheckIcon}
                        toneClass="text-indigo-200"
                        accent="bg-[radial-gradient(circle,rgba(129,140,248,0.24),transparent_60%)]"
                    />
                </section>

                <section className="panel-muted px-6 py-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Keluarga Terdaftar</h3>
                            <p className="text-sm text-white/55">Daftar akun warga yang telah terdaftar dalam sistem.</p>
                        </div>
                        <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/60">
                            Akses Admin
                        </span>
                    </div>

                    {families.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10 text-sm text-white/80">
                                <thead>
                                    <tr className="text-xs uppercase tracking-[0.2em] text-white/40">
                                        <th className="px-4 py-3 text-left">Nama</th>
                                        <th className="px-4 py-3 text-left">NIK</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Status Iuran</th>
                                        <th className="px-4 py-3 text-left">Terdaftar</th>
                                        <th className="px-4 py-3 text-left">Login Terakhir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {families.map((family) => (
                                        <tr key={family.id} className="hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-white">{family.name}</td>
                                            <td className="px-4 py-3 text-white/70">{family.nik ?? '-'}</td>
                                            <td className="px-4 py-3 text-white/70">{family.email}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                                                        family.has_paid_dues
                                                            ? 'bg-emerald-500/20 text-emerald-200'
                                                            : 'bg-white/10 text-white/60'
                                                    }`}
                                                >
                                                    {family.has_paid_dues ? 'Sudah Bayar' : 'Belum Bayar'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-white/70">{formatDateTime(family.registered_at)}</td>
                                            <td className="px-4 py-3 text-white/70">{formatDateTime(family.last_login_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                            Belum ada keluarga yang terdaftar.
                        </div>
                    )}
                </section>

                <section className="panel-muted px-6 py-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Tren 6 Bulan</h3>
                            <p className="text-sm text-white/55">Total iuran yang masuk per bulan berdasarkan pilihan filter.</p>
                        </div>
                        <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/60">Ringkasan Historis</span>
                    </div>

                    {Array.isArray(trend) && trend.length > 0 ? (
                        <div className="overflow-x-auto">
                            <div className="flex h-56 items-end gap-6">
                                {trend.map((item, index) => {
                                    const max = Math.max(...trend.map((entry) => entry.keseluruhan || 0), 1);
                                    const height = Math.round(((item.keseluruhan || 0) / max) * 100);
                                    return (
                                        <div key={index} className="flex flex-col items-center gap-3">
                                            <div className="relative flex h-full w-12 items-end justify-center">
                                                <div
                                                    className="w-full rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-blue-700 shadow-[0_18px_45px_-20px_rgba(37,99,235,0.8)]"
                                                    style={{ height: `${height}%` }}
                                                    title={`${item.label}: ${new Intl.NumberFormat('id-ID').format(item.keseluruhan || 0)}`}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-white/55">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                            Tidak ada data tren.
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
