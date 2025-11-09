import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current?.focus();
        }
    }, [isFocused]);

    const baseClass = [
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition',
        'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-[#040112]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
    ].join(' ');

    return (
        <div className="flex flex-col items-start w-full">
            <input {...props} type={type} className={baseClass} ref={input} />
        </div>
    );
});
