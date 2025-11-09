export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    const baseClass = [
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide text-white',
        'bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-700',
        'shadow-[0_20px_45px_-18px_rgba(37,99,235,0.85)] transition-all duration-300 ease-out',
        'border border-white/20 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-[0_26px_55px_-22px_rgba(37,99,235,0.9)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040112]',
        disabled ? 'cursor-not-allowed opacity-60 hover:translate-y-0' : '',
        className,
    ].join(' ');

    return (
        <button {...props} className={baseClass} disabled={disabled}>
            {children}
        </button>
    );
}
