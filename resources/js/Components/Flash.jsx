import { useEffect, useState } from 'react';

const toneStyles = {
    success: 'border-emerald-400/40 bg-emerald-500/12 text-emerald-100 shadow-[0_24px_60px_-30px_rgba(16,185,129,0.45)]',
    warning: 'border-amber-400/40 bg-amber-500/12 text-amber-100 shadow-[0_24px_60px_-30px_rgba(245,158,11,0.45)]',
    error: 'border-rose-400/40 bg-rose-500/12 text-rose-100 shadow-[0_24px_60px_-30px_rgba(244,63,94,0.45)]',
};

export default function Flash({ message, type = 'success', duration = 3500 }) {
    const [open, setOpen] = useState(!!message);

    useEffect(() => {
        setOpen(!!message);
        if (message) {
            const t = setTimeout(() => setOpen(false), duration);
            return () => clearTimeout(t);
        }
    }, [message, duration]);

    if (!open || !message) return null;

    const toneClass = toneStyles[type] ?? toneStyles.success;

    return (
        <div
            className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium backdrop-blur-xl ${toneClass}`}
        >
            <span>{message}</span>
            <button
                type="button"
                className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs text-white/80 transition hover:bg-white/20"
                onClick={() => setOpen(false)}
            >
                ×
            </button>
        </div>
    );
}
