import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex flex-col gap-3">
                    <span className="badge-soft w-fit">Pengaturan Akun</span>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Profil Pengguna</h2>
                        <p className="mt-2 text-sm text-white/60">
                            Perbarui identitas digital, keamanan akun, dan preferensi personal Anda.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Profil" />

            <div className="mx-auto w-full max-w-4xl space-y-8">
                <section className="panel-muted px-6 py-7">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="space-y-6" />
                </section>

                <section className="panel-muted px-6 py-7">
                    <UpdatePasswordForm className="space-y-6" />
                </section>

                <section className="panel-muted px-6 py-7">
                    <DeleteUserForm className="space-y-6" />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
