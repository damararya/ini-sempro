export default function InputLabel({ value, className = '', children, ...props }) {
    const baseClass = ['block text-sm font-semibold uppercase tracking-[0.18em] text-white/60', className].join(' ');

    return (
        <label {...props} className={baseClass}>
            {value ? value : children}
        </label>
    );
}
