import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    const baseClass = [
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out',
        active
            ? 'border border-white/25 bg-white/15 text-white shadow-[0_18px_40px_-20px_rgba(59,130,246,0.65)]'
            : 'border border-transparent text-white/65 hover:text-white hover:border-white/15 hover:bg-white/10',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040112]',
        className,
    ].join(' ');

    return (
        <Link {...props} className={baseClass}>
            {children}
        </Link>
    );
}
