export default function Checkbox({ className = '', ...props }) {
    const baseClass = [
        'h-4 w-4 rounded-md border-white/25 bg-white/5 text-sky-400 shadow-sm',
        'focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-[#040112]',
        'dark:border-white/25 dark:bg-white/5',
        className,
    ].join(' ');

    return <input {...props} type="checkbox" className={baseClass} />;
}
