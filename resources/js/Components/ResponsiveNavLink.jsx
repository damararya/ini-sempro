import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    const baseClass = [
        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
        active
            ? 'border border-white/25 bg-white/12 text-white shadow-[0_12px_32px_-20px_rgba(59,130,246,0.6)]'
            : 'border border-transparent text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040112]',
        className,
    ].join(' ');

    return (
        <Link {...props} className={baseClass}>
            {children}
        </Link>
    );
}
