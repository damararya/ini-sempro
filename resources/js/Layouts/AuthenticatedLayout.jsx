import { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import Flash from '@/Components/Flash';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Authenticated({ auth, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const isAdmin = Boolean(auth?.user?.is_admin);
    const { props } = usePage();
    const flashMessage = props?.flash?.message ?? null;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#040112] text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_65%)] blur-3xl" />
                <div className="absolute top-48 right-[-8rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_65%)] blur-3xl" />
                <div className="absolute bottom-[-10rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent_65%)] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(5,7,23,0.95),rgba(7,11,32,0.75))]" />
                <div className="absolute inset-0 mix-blend-overlay opacity-40" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22 viewBox=%220 0 240 240%22%3E%3Cpath fill=%22rgba(148,163,184,0.08)%22 d=%22M120 0h120v120H120zM0 120h120v120H0z%22/%3E%3C/svg%3E")' }} />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050b1f]/80 backdrop-blur-2xl">
                    <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="group inline-flex items-center gap-3">
                                <ApplicationLogo className="h-11 w-auto drop-shadow-[0_18px_45px_rgba(59,130,246,0.5)] transition group-hover:drop-shadow-[0_24px_65px_rgba(56,189,248,0.45)]" alt="Logo" />
                                <span className="hidden text-lg font-semibold tracking-wide text-white/80 transition group-hover:text-white md:inline">
                                    Perumnas Blok F
                                </span>
                            </Link>

                            <div className="hidden items-center gap-2 md:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dasbor
                                </NavLink>
                                {isAdmin && (
                                    <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden items-center gap-4 md:flex">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)] transition hover:border-white/25 hover:bg-white/14">
                                        <span>{auth.user.name}</span>
                                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Keluar
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 shadow-sm transition hover:border-white/25 hover:bg-white/15"
                            >
                                {showingNavigationDropdown ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div
                        className={`md:hidden ${
                            showingNavigationDropdown ? 'block' : 'hidden'
                        } border-t border-white/10 bg-[#050b1f]/90 px-5 pb-6 backdrop-blur-2xl`}
                    >
                        <div className="mt-4 space-y-2">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                Dasbor
                            </ResponsiveNavLink>
                            {isAdmin && (
                                <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                    Admin
                                </ResponsiveNavLink>
                            )}
                        </div>
                        <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                            <div className="font-semibold text-white">{auth.user.name}</div>
                            <div className="text-xs text-white/60">{auth.user.email}</div>
                            <ResponsiveNavLink href={route('profile.edit')}>Profil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Keluar
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="mx-auto w-full max-w-6xl px-5 pt-10">
                        <div className="panel-muted px-6 py-5">
                            {header}
                        </div>
                    </header>
                )}

                {flashMessage && (
                    <div className="mx-auto w-full max-w-6xl px-5 pt-6">
                        <Flash message={flashMessage} />
                    </div>
                )}

                <main className="flex-1 w-full">
                    <div className="mx-auto w-full max-w-6xl px-5 py-12">
                        {children}
                    </div>
                </main>

                <footer className="border-t border-white/10 bg-white/5 py-5 backdrop-blur-2xl">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-white/60 sm:flex-row">
                        <span>Perumnas Blok F &copy; {new Date().getFullYear()}</span>
                        <span className="text-white/40">Membangun komunitas dengan teknologi.</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
