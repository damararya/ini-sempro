import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="space-y-6 text-left">
                <div className="space-y-3">
                    <span className="badge-soft w-fit">Keamanan Akun</span>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">Lupa kata sandi?</h1>
                        <p className="mt-2 text-sm text-white/60">
                            Masukkan email Anda dan kami akan mengirim tautan untuk mengatur ulang kata sandi secara aman.
                        </p>
                    </div>
                </div>

                {status && (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/12 px-5 py-4 text-sm text-emerald-200 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.6)]">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput id="email" type="email" name="email" value={data.email} isFocused={true} onChange={onHandleChange} />
                        <InputError message={errors.email} className="text-xs text-rose-300" />
                    </div>

                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Kirim tautan reset
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
}
