import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children, showFooter = true, containerClassName = '', cardClassName = '', disableCard = false, showHeader = true }) {
    const cardBaseClass = 'relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 shadow-[0_60px_140px_-60px_rgba(8,12,24,0.9)] backdrop-blur-2xl sm:p-12 lg:p-16';

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#050412] text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_60%)]" />
                <div className="absolute -top-1/3 -left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35),transparent_65%)] blur-3xl" />
                <div className="absolute -bottom-1/4 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.22),transparent_65%)] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,4,18,0.95),rgba(15,23,42,0.55))]" />
                <div className="absolute inset-0 mix-blend-overlay opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22 viewBox=%220 0 240 240%22%3E%3Cpath fill=%22rgba(148,163,184,0.08)%22 d=%22M120 0h120v120H120zM0 120h120v120H0z%22/%3E%3C/svg%3E")' }} />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col">
                {showHeader && (
                    <header className="mx-auto w-full max-w-7xl px-6 pt-10">
                        <Link
                            href="/"
                            className="group inline-flex w-fit items-center gap-3 text-base font-semibold text-slate-200"
                        >
                            <ApplicationLogo className="h-12 w-auto drop-shadow-[0_18px_45px_rgba(59,130,246,0.55)] transition duration-500 group-hover:drop-shadow-[0_30px_65px_rgba(56,189,248,0.45)]" alt="Logo" />
                            <span className="hidden text-lg tracking-wide text-white/70 transition duration-500 group-hover:text-white sm:inline">
                                Perumnas Blok F
                            </span>
                        </Link>
                    </header>
                )}

                <main className={`flex flex-1 w-full items-center justify-center px-6 pb-12 ${containerClassName}`}>
                    {disableCard ? (
                        <div className={`w-full ${cardClassName}`}>
                            {children}
                        </div>
                    ) : (
                        <div className={`${cardBaseClass} ${cardClassName}`}>
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-[1px] rounded-[2.45rem] border border-white/5" />
                                <div className="absolute -top-28 right-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_60%)] blur-3xl" />
                                <div className="absolute -bottom-32 left-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_60%)] blur-3xl" />
                            </div>

                            <div className="relative z-10">
                                {children}
                            </div>
                        </div>
                    )}
                </main>

                {showFooter && (
                    <footer className="border-t border-white/10 bg-white/[0.06] px-6 py-5 text-xs text-slate-400 backdrop-blur-xl">
                        <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                            <span>Perumnas Blok F &copy; {new Date().getFullYear()}</span>
                            <span className="text-white/40">
                                Dibangun dengan rasa kebersamaan komunitas.
                            </span>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}


