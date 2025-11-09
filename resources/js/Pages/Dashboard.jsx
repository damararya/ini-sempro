import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { UsersIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Dashboard(props) {
    const collected = props?.dashboard?.collected ?? 1_000_000;
    const target = props?.dashboard?.target ?? 5_000_000;
    const familiesCount = props?.dashboard?.familiesCount ?? 50;
    const trashPaid = props?.dashboard?.trashPaid ?? false;
    const rondaPaid = props?.dashboard?.rondaPaid ?? true;
    const isAdmin = Boolean(props?.auth?.user?.is_admin);

    const percent = Math.min(100, Math.round((collected / Math.max(1, target)) * 100));
    const formatIDR = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const ActionLink = ({ href, label, variant = 'primary' }) => (
        <Link
            href={href}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                variant === 'primary'
                    ? 'border border-white/20 bg-white/12 text-white/90 hover:border-white/30 hover:bg-white/16'
                    : 'border border-white/15 text-white/75 hover:border-white/25 hover:bg-white/12'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="badge-soft">Portal Warga</span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Dasbor Warga</h2>
                        <p className="mt-2 text-sm text-white/60">
                            Pantau iuran, cek tanggungan keluarga, dan ikuti perkembangan terbaru lingkungan Blok F.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right text-xs text-white/60">
                        <div>{new Date().toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>
            }
        >
            <Head title="Dasbor" />

            <div className="space-y-8">
                {isAdmin && (
                    <section className="panel-muted overflow-hidden px-6 py-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/65">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Progres Iuran Bulan Ini</p>
                                <div className="text-base font-semibold text-white">{formatIDR(collected)} / {formatIDR(target)}</div>
                            </div>
                            <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70">
                                {percent}% Tercapai
                            </span>
                        </div>
                        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/8">
                            <span
                                className="block h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-blue-700 shadow-[0_12px_30px_-12px_rgba(37,99,235,0.9)]"
                                style={{ width: `${percent}%` }}
                            ></span>
                        </div>
                    </section>
                )}

                <section className={`grid grid-cols-1 gap-6 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                    {isAdmin && (
                        <article className="panel-muted relative overflow-hidden px-6 py-7">
                            <div className="pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.22),transparent_65%)] blur-3xl" />
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-200">
                                        <UsersIcon className="h-7 w-7" />
                                    </div>
                                    <span className="text-4xl font-semibold text-white">{familiesCount}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Jumlah Keluarga</h3>
                                    <p className="mt-1 text-sm text-white/60">Keluarga terdata pada sistem administrasi Blok F.</p>
                                </div>
                                <ActionLink href={route('admin.dashboard')} label="Kelola Data" variant="secondary" />
                            </div>
                        </article>
                    )}

                    <article className="panel-muted relative overflow-hidden px-6 py-7">
                        <div className="pointer-events-none absolute -top-16 right-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.28),transparent_65%)] blur-3xl" />
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
                                    <TrashIcon className="h-7 w-7" />
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    trashPaid ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/70'
                                }`}>
                                    {trashPaid ? 'Sudah dibayar' : 'Belum dibayar'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Iuran Sampah</h3>
                                <p className="mt-1 text-sm text-white/60">Pembayaran pengelolaan sampah lingkungan bulan berjalan.</p>
                            </div>
                            <ActionLink
                                href={route('iuran.pay.create', { type: 'sampah' })}
                                label={trashPaid ? 'Lihat Riwayat' : 'Bayar Sekarang'}
                                variant={trashPaid ? 'secondary' : 'primary'}
                            />
                        </div>
                    </article>

                    <article className="panel-muted relative overflow-hidden px-6 py-7">
                        <div className="pointer-events-none absolute -top-16 right-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),transparent_65%)] blur-3xl" />
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-200">
                                    <ShieldCheckIcon className="h-7 w-7" />
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    rondaPaid ? 'bg-sky-500/20 text-sky-100' : 'bg-white/10 text-white/70'
                                }`}>
                                    {rondaPaid ? 'Sudah dibayar' : 'Belum dibayar'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Iuran Ronda</h3>
                                <p className="mt-1 text-sm text-white/60">Dukungan keamanan lingkungan melalui jadwal ronda.</p>
                            </div>
                            <ActionLink
                                href={route('iuran.pay.create', { type: 'ronda' })}
                                label={rondaPaid ? 'Lihat Riwayat' : 'Bayar Sekarang'}
                                variant={rondaPaid ? 'secondary' : 'primary'}
                            />
                        </div>
                    </article>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
