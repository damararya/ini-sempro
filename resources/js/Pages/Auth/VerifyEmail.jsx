import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (event) => {
        event.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="space-y-6 text-left">
                <div className="space-y-3">
                    <span className="badge-soft w-fit">Aktivasi Akun</span>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">Verifikasi email Anda</h1>
                        <p className="mt-2 text-sm text-white/60">
                            Kami telah mengirim tautan verifikasi. Tidak menemukan email? Kirim ulang atau keluar untuk menggunakan alamat lain.
                        </p>
                    </div>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/12 px-5 py-4 text-sm text-emerald-200 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.6)]">
                        Tautan verifikasi baru telah dikirim ke email Anda.
                    </div>
                )}

                <form onSubmit={submit} className="grid gap-3">
                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Kirim ulang email verifikasi
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="inline-flex w-full justify-center rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:border-white/28 hover:bg-white/16"
                    >
                        Keluar
                    </Link>
                </form>
            </div>
        </GuestLayout>
    );
}
