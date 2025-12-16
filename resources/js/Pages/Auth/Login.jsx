import Checkbox from '@/Components/Checkbox';
import ApplicationLogo from '@/Components/ApplicationLogo';

import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import useResetOnUnmount from '@/Hooks/useResetOnUnmount';
import { Head, Link, useForm } from '@inertiajs/react';

const infoHighlights = [
    {
        title: 'Iuran Sampah & Ronda',
        description: 'Satu portal untuk memastikan kewajiban iuran sampah dan ronda warga selalu terbayar tepat waktu.',
    },
    {
        title: 'Kompak Jaga Lingkungan',
        description: 'Kolaborasi warga Blok F menjaga kebersihan dan keamanan lingkungan sepanjang pekan.',
    },
    {
        title: 'Transparan & Terdokumentasi',
        description: 'Lihat histori pembayaran, status verifikasi, dan bukti transfer kapan saja tanpa repot.',
    },
];
export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useResetOnUnmount(reset, 'password');

    const handleOnChange = (event) => {
        const { name, type, checked, value } = event.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout
            showFooter={false}
            showHeader={false}
            disableCard
            containerClassName="py-16"
            cardClassName="mx-auto w-full max-w-7xl"
        >
            <Head title="Masuk" />

            <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[3.5rem] border border-white/12 bg-gradient-to-br from-white/18 via-white/[0.05] to-white/[0.02] p-6 shadow-[0_60px_160px_-60px_rgba(8,10,42,0.9)] backdrop-blur-[30px] sm:p-10 lg:p-16">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.55),transparent_65%)] blur-[130px]" />
                    <div className="absolute -bottom-48 -left-32 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.45),transparent_68%)] blur-[150px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(9,12,44,0.88),rgba(14,19,58,0.58))]" />
                    <div
                        className="absolute inset-0 opacity-40 mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'360\' height=\'360\' viewBox=\'0 0 360 360\'%3E%3Cdefs%3E%3ClinearGradient id=\'g\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop stop-color=\'%23ffffff\' stop-opacity=\'0.09\' offset=\'0%25\'/%3E%3Cstop stop-color=\'%23ffffff\' stop-opacity=\'0\' offset=\'100%25\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d=\'M360 0H0v360h360V0zm-84 84H84v192h192V84z\' fill=\'url(%23g)\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                        }}
                    />
                    <div className="absolute top-20 left-20 h-32 w-32 rounded-full border border-white/30 bg-white/20 opacity-60 blur-2xl" />
                    <div className="absolute bottom-16 right-24 h-24 w-24 rounded-full bg-gradient-to-br from-sky-400/70 via-indigo-400/40 to-transparent opacity-80 blur-xl animate-[spin_22s_linear_infinite]" />
                </div>

                <div className="relative z-10 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
                    <div className="space-y-10 text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/70 shadow-[0_22px_60px_-35px_rgba(56,189,248,0.65)]">
                            Portal Iuran Warga
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Kelola Iuran Sampah & Ronda Blok F
                            </h1>
                            <p className="max-w-2xl text-base text-white/70 sm:text-lg">
                                Pantau iuran sampah dan ronda, atur jadwal pembayaran, dan jaga lingkungan Blok F tetap bersih serta aman.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {infoHighlights.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-white/80 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.9)]"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{item.title}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-white/70">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-sky-400/40 via-indigo-400/20 to-fuchsia-400/30 opacity-70 blur-3xl" />
                        <div className="relative overflow-hidden rounded-[2.3rem] border border-white/20 bg-[#0b0f2c]/85 p-8 shadow-[0_45px_110px_-45px_rgba(37,99,235,0.85)] backdrop-blur-[22px] sm:p-10">
                            <div className="pointer-events-none absolute -top-12 right-12 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.45),transparent_70%)] blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-16 left-16 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35),transparent_70%)] blur-2xl" />

                            <div className="relative z-10">
                                <form onSubmit={submit} className="space-y-8">
                                    <div className="space-y-4">
                                        <nav className="flex items-center justify-center">
                                            <Link
                                                href="/"
                                                className="group inline-flex items-center gap-3 text-sm font-semibold text-white/70 transition hover:text-white"
                                            >
                                                <ApplicationLogo className="h-10 w-auto drop-shadow-[0_18px_45px_rgba(59,130,246,0.45)] transition duration-500 group-hover:drop-shadow-[0_26px_60px_rgba(56,189,248,0.4)]" alt="Logo" />
                                                <span className="tracking-wide">Perumnas Blok F</span>
                                            </Link>
                                        </nav>

                                        <header className="space-y-2 text-center">
                                            <h2 className="text-2xl font-semibold text-white">Masuk ke Portal</h2>
                                            <p className="text-xs text-white/50">Kelola iuran, ronda, dan informasi warga dalam satu dasbor.</p>
                                        </header>

                                        {status && (
                                            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-5 py-4 text-sm text-emerald-100">
                                                {status}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <InputLabel htmlFor="email" value="Email" />
                                                <TextInput
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={data.email}
                                                    autoComplete="username"
                                                    isFocused={true}
                                                    onChange={handleOnChange}
                                                />
                                                <InputError message={errors.email} className="text-xs text-rose-300" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel htmlFor="password" value="Kata sandi" />
                                                <TextInput
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={data.password}
                                                    autoComplete="current-password"
                                                    onChange={handleOnChange}
                                                    enablePasswordToggle
                                                />
                                                <InputError message={errors.password} className="text-xs text-rose-300" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
                                            <label className="flex items-center gap-3">
                                                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-lg border border-white/25 bg-white/10">
                                                    <Checkbox
                                                        name="remember"
                                                        checked={data.remember}
                                                        onChange={handleOnChange}
                                                        className="h-4 w-4 rounded-[0.55rem] border-transparent bg-white/70 text-sky-500 focus:ring-white/60"
                                                    />
                                                </span>
                                                Ingat saya
                                            </label>

                                            {canResetPassword && (
                                                <Link href={route('password.request')} className="font-semibold text-sky-300 transition hover:text-sky-100">
                                                    Lupa kata sandi?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="grid gap-3">
                                            <button
                                                type="submit"
                                                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white shadow-[0_24px_60px_-30px_rgba(59,130,246,0.85)] transition hover:translate-y-[1px] hover:shadow-[0_20px_55px_-28px_rgba(59,130,246,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f2c] disabled:cursor-not-allowed disabled:opacity-60"
                                                disabled={processing}
                                            >
                                                Masuk Sekarang
                                            </button>

                                            <Link
                                                href={route('register')}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80 transition hover:border-white/28 hover:bg-white/16"
                                            >
                                                Buat akun baru
                                            </Link>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
