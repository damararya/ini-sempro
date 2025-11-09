import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import useResetOnUnmount from '@/Hooks/useResetOnUnmount';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nik: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useResetOnUnmount(reset, 'password', 'password_confirmation');

    const handleOnChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <form onSubmit={submit} className="space-y-7">
                <div className="space-y-3 text-left">
                    <span className="badge-soft w-fit">Mulai Bergabung</span>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">Buat Akun Baru</h1>
                        <p className="mt-2 text-sm text-white/60">
                            Daftarkan diri Anda untuk mengelola iuran, jadwal ronda, dan informasi warga secara elegan.
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="name" value="Nama Lengkap" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            autoComplete="name"
                            isFocused={true}
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.name} className="text-xs text-rose-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="nik" value="NIK" />
                        <TextInput
                            id="nik"
                            name="nik"
                            value={data.nik}
                            autoComplete="off"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={16}
                            onChange={handleOnChange}
                            required
                        />
                        <p className="text-xs text-white/60">Masukkan NIK sesuai kartu identitas Anda (16 digit).</p>
                        <InputError message={errors.nik} className="text-xs text-rose-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.email} className="text-xs text-rose-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.password} className="text-xs text-rose-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={handleOnChange}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="text-xs text-rose-300" />
                    </div>
                </div>

                <div className="grid gap-3 pt-2">
                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Daftar
                    </PrimaryButton>

                    <Link
                        href={route('login')}
                        className="inline-flex w-full justify-center rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:border-white/28 hover:bg-white/16"
                    >
                        Sudah punya akun? Masuk
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
