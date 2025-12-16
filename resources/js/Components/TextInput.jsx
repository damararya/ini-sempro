import { forwardRef, useEffect, useRef, useState } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, enablePasswordToggle = false, ...props },
    ref
) {
    const input = ref ? ref : useRef();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isFocused) {
            input.current?.focus();
        }
    }, [isFocused]);

    const isPasswordField = type === 'password';
    const canTogglePassword = enablePasswordToggle && isPasswordField;
    const resolvedType = canTogglePassword ? (showPassword ? 'text' : 'password') : type;

    const baseClass = [
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition',
        'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-[#040112]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
        canTogglePassword ? 'pr-12' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="flex w-full flex-col items-start">
            <div className="relative w-full">
                <input {...props} type={resolvedType} className={baseClass} ref={input} />
                {canTogglePassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 transition hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                        aria-pressed={showPassword}
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                )}
            </div>
        </div>
    );
});

function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12c1.5-4 5.25-6.75 9.75-6.75s8.25 2.75 9.75 6.75c-1.5 4-5.25 6.75-9.75 6.75S3.75 16 2.25 12z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function EyeSlashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24M6.228 6.228C4.186 7.695 2.727 9.68 2.25 12c1.5 4 5.25 6.75 9.75 6.75 1.58 0 3.08-.28 4.45-.8M12.75 7.27c.23-.02.47-.02.7-.02 4.5 0 8.25 2.75 9.75 6.75-.55 1.47-1.39 2.79-2.44 3.92"
            />
        </svg>
    );
}
