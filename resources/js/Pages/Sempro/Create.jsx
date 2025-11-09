import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Create(props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('sempro.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-col gap-3">
                    <span className="badge-soft w-fit">Seminar Proposal</span>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Buat Sempro</h2>
                        <p className="mt-2 text-sm text-white/60">
                            Catat agenda seminar secara elegan, lengkap dengan deskripsi dan kategori tematik.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Buat Sempro" />

            <div className="mx-auto w-full max-w-4xl">
                <section className="panel-muted px-6 py-7">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <InputLabel htmlFor="title" value="Judul" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="text-xs text-rose-300" />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="description" value="Deskripsi" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                className="min-h-[160px] w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/85 shadow-inner shadow-black/20 placeholder:text-white/40 focus:border-sky-400/70 focus:outline-none focus:ring-2 focus:ring-sky-300/40 focus:ring-offset-2 focus:ring-offset-[#040112]"
                                placeholder="Tuliskan gambaran singkat mengenai seminar proposal"
                            />
                            <InputError message={errors.description} className="text-xs text-rose-300" />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="category" value="Kategori" />
                            <TextInput
                                id="category"
                                type="text"
                                value={data.category}
                                onChange={(event) => setData('category', event.target.value)}
                                placeholder="Contoh: Akademik, Sosial, Administrasi"
                            />
                            <InputError message={errors.category} className="text-xs text-rose-300" />
                        </div>

                        <div className="flex justify-end">
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Mengirim...' : 'Simpan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
