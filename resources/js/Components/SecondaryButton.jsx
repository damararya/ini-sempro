export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    const baseClass = [
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white/85',
        'border border-white/18 bg-white/10 backdrop-blur-sm shadow-[0_18px_45px_-25px_rgba(15,23,42,0.85)]',
        'transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-white hover:border-white/30 hover:bg-white/14',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040112]',
        disabled ? 'cursor-not-allowed opacity-50 hover:translate-y-0' : '',
        className,
    ].join(' ');

    return (
        <button {...props} type={type} className={baseClass} disabled={disabled}>
            {children}
        </button>
    );
}
