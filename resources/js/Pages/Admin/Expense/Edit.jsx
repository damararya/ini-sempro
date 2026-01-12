import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import ExpenseForm from './Form';

export default function Edit(props) {
    const { expense } = props;

    const normalizeDate = (value) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const initialValues = { ...expense, spent_at: normalizeDate(expense.spent_at) };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-col gap-3">
                    <span className="badge-soft w-fit">Transparansi Pengeluaran</span>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Edit Pengeluaran</h2>
                        <p className="mt-2 text-sm text-white/60">Perbarui detail pengeluaran agar sesuai laporan.</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Pengeluaran" />

            <div className="mx-auto w-full max-w-3xl">
                <section className="panel-muted px-6 py-7">
                    <ExpenseForm
                        initialValues={initialValues}
                        onSubmitRoute={route('admin.expenses.update', expense.id)}
                        method="put"
                        submitLabel="Perbarui"
                    />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
