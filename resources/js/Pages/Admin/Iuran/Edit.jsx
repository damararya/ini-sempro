import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import IuranForm from './Form';

export default function Edit(props) {
    const { users, iuran, fixedAmount } = props;

    const normalize = (value) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const initialValues = { ...iuran, paid_at: normalize(iuran.paid_at) };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-col gap-3">
                    <span className="badge-soft w-fit">Administrasi Iuran</span>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Edit Iuran</h2>
                        <p className="mt-2 text-sm text-white/60">Perbarui status dan informasi iuran yang sudah tercatat dalam sistem.</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Iuran" />

            <div className="mx-auto w-full max-w-3xl">
                <section className="panel-muted px-6 py-7">
                    <IuranForm
                        users={users}
                        fixedAmount={fixedAmount}
                        initialValues={initialValues}
                        onSubmitRoute={route('admin.iurans.update', iuran.id)}
                        method="put"
                        submitLabel="Perbarui"
                    />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
