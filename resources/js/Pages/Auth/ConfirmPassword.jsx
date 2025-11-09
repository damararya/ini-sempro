import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import useResetOnUnmount from '@/Hooks/useResetOnUnmount';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useResetOnUnmount(reset, 'password');

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <div className="space-y-6 text-left">
                <div className="space-y-3">
                    <span className="badge-soft w-fit">Verifikasi Lanjutan</span>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">Konfirmasi kata sandi</h1>
                        <p className="mt-2 text-sm text-white/60">Untuk keamanan, masukkan kata sandi Anda sebelum melanjutkan proses sensitif.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Kata sandi" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            isFocused={true}
                            onChange={handleOnChange}
                        />
                        <InputError message={errors.password} className="text-xs text-rose-300" />
                    </div>

                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Konfirmasi
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
}

