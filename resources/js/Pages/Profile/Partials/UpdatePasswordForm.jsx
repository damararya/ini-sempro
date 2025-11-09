import { useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (event) => {
        event.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Ganti Kata Sandi</h2>
                <p className="text-sm text-white/60">Gunakan kombinasi unik untuk menjaga kredensial akun Anda tetap aman.</p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div className="space-y-2">
                    <InputLabel htmlFor="current_password" value="Kata Sandi Saat Ini" />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(event) => setData('current_password', event.target.value)}
                        type="password"
                        autoComplete="current-password"
                    />

                    <InputError message={errors.current_password} className="text-xs text-rose-300" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        type="password"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="text-xs text-rose-300" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                        type="password"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password_confirmation} className="text-xs text-rose-300" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan</PrimaryButton>

                    <Transition show={recentlySuccessful} enterFrom="opacity-0" leaveTo="opacity-0" className="transition ease-in-out">
                        <p className="text-sm text-emerald-200">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
