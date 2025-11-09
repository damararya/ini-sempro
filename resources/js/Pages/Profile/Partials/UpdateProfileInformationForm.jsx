import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Informasi Profil</h2>
                <p className="text-sm text-white/60">Perbarui informasi pribadi dan alamat email yang terhubung dengan akun Anda.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="space-y-2">
                    <InputLabel htmlFor="nik" value="NIK" />
                    <TextInput id="nik" value={user.nik ?? 'Belum diisi'} readOnly disabled />
                    {!user.nik && <p className="text-xs text-white/60">Lengkapi NIK Anda dengan menghubungi admin.</p>}
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="name" value="Nama" />

                    <TextInput
                        id="name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2 text-xs text-rose-300" message={errors.name} />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2 text-xs text-rose-300" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="space-y-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        <p>Alamat email Anda belum terverifikasi.</p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="inline-flex items-center justify-center rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition hover:border-white/50 hover:bg-white/10"
                        >
                            Kirim ulang email verifikasi
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="text-xs font-medium text-emerald-200">
                                Tautan verifikasi baru telah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

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
