import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import ExpenseForm from './Form';

export default function Create(props) {
    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-col gap-3">
                    <span className="badge-soft w-fit">Transparansi Pengeluaran</span>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Tambah Pengeluaran</h2>
                        <p className="mt-2 text-sm text-white/60">Catat pengeluaran agar tampil di laporan PDF transparansi.</p>
                    </div>
                </div>
            }
        >
            <Head title="Tambah Pengeluaran" />

            <div className="mx-auto w-full max-w-3xl">
                <section className="panel-muted px-6 py-7">
                    <ExpenseForm onSubmitRoute={route('admin.expenses.store')} submitLabel="Simpan" />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
