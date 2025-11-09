import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import IuranForm from './Form';

export default function Create(props) {
    const { users, fixedAmount } = props;

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-col gap-3">
                    <span className="badge-soft w-fit">Administrasi Iuran</span>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Buat Iuran</h2>
                        <p className="mt-2 text-sm text-white/60">Tambahkan data iuran baru dengan nominal yang sudah ditetapkan komunitas.</p>
                    </div>
                </div>
            }
        >
            <Head title="Buat Iuran" />

            <div className="mx-auto w-full max-w-3xl">
                <section className="panel-muted px-6 py-7">
                    <IuranForm users={users} fixedAmount={fixedAmount} onSubmitRoute={route('admin.iurans.store')} submitLabel="Simpan" />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
