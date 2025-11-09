import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import useResetOnUnmount from '@/Hooks/useResetOnUnmount';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    useResetOnUnmount(reset, 'password', 'password_confirmation');

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            <div className="space-y-6 text-left">
                <div className="space-y-3">
                    <span className="badge-soft w-fit">Keamanan Akun</span>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">Atur ulang kata sandi</h1>
                        <p className="mt-2 text-sm text-white/60">Masukkan kredensial Anda dan tetapkan kata sandi baru yang lebih kuat.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput id="email" type="email" name="email" value={data.email} autoComplete="username" onChange={onHandleChange} />
                        <InputError message={errors.email} className="text-xs text-rose-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Kata sandi baru" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={onHandleChange}
                        />
                        <InputError message={errors.password} className="text-xs text-rose-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi kata sandi" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={onHandleChange}
                        />
                        <InputError message={errors.password_confirmation} className="text-xs text-rose-300" />
                    </div>

                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Simpan kata sandi
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
}

