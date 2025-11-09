export default function DangerButton({ className = '', disabled, children, ...props }) {
    const baseClass = [
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide text-white',
        'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500',
        'shadow-[0_20px_45px_-20px_rgba(244,63,94,0.85)] border border-white/15 backdrop-blur-sm',
        'transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-24px_rgba(244,63,94,0.9)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040112]',
        disabled ? 'cursor-not-allowed opacity-60 hover:translate-y-0' : '',
        className,
    ].join(' ');

    return (
        <button {...props} className={baseClass} disabled={disabled}>
            {children}
        </button>
    );
}
