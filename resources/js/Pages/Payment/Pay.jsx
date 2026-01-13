import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React from 'react';

const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function Pay(props) {
    const {
        type,
        fixedAmount = 120000,
        paidThisPeriod = false,
        periodLabel,
        lastPayments = [],
        paymentPeriodMonths = 3,
        pendingProof = null,
    } = props;

    const { data, setData, post, processing, errors, reset } = useForm({ amount: fixedAmount });
    const proofForm = useForm({ proof: null });

    const proofInputRef = React.useRef(null);

    React.useEffect(() => {
        setData('amount', fixedAmount);
    }, [fixedAmount]);

    const isAdmin = Boolean(props?.auth?.user?.is_admin);
    const isSampah = type === 'sampah';
    const title = isSampah ? 'Bayar Iuran Sampah' : 'Bayar Iuran Ronda';
    const otherType = isSampah ? 'ronda' : 'sampah';

    const submit = (event) => {
        event.preventDefault();
        post(route('iuran.pay.store', { type }), {
            preserveScroll: true,
            onSuccess: () => {
                reset('amount');
            },
        });
    };

    const submitManual = () => {
        router.post(route('iuran.pay.manual', { type }), {}, { preserveScroll: true });
    };

    const handleProofChange = (event) => {
        const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
        proofForm.setData('proof', file);
    };

    const submitProof = (event) => {
        event.preventDefault();
        if (!pendingProof) {
            return;
        }

        proofForm.post(route('iuran.pay.proof', pendingProof.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                proofForm.reset();
                if (proofInputRef.current) {
                    proofInputRef.current.value = '';
                }
            },
        });
    };

    const periodText = periodLabel || `Periode ${paymentPeriodMonths} Bulan`;

    const badgeClasses = 'inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-white/70';

    const navLinkClass =
        'inline-flex items-center justify-center rounded-full border border-white/18 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:border-white/28 hover:bg-white/14';

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="badge-soft">Pembayaran Iuran</span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h2>
                        <p className="mt-2 text-sm text-white/60">
                            Lakukan pembayaran dengan mudah, pantau status periode, dan unggah bukti transfer secara instan.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-white/60">
                        <div className="text-white/80">{periodText}</div>
                        <div className="mt-1 text-white/50">Nominal tetap {formatIDR(fixedAmount)}</div>
                    </div>
                </div>
            }
        >
            <Head title={title} />

            <div className="space-y-10">
                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <article className="panel-muted px-6 py-6">
                        <div className="flex h-full flex-col justify-between gap-4">
                            <div className="space-y-2">
                                <span className={badgeClasses}>Jenis Iuran</span>
                                <h3 className="text-2xl font-semibold text-white capitalize">{type}</h3>
                                <p className="text-sm text-white/60">
                                    Pembayaran otomatis tercatat sesuai kategori untuk administrasi lingkungan.
                                </p>
                            </div>
                            <Link href={route('iuran.pay.create', { type: otherType })} className={navLinkClass}>
                                Ke Iuran {otherType}
                            </Link>
                        </div>
                    </article>
                    <article className="panel-muted px-6 py-6">
                        <div className="flex h-full flex-col gap-4">
                            <span className={badgeClasses}>Periode</span>
                            <h3 className="text-2xl font-semibold text-white">{periodText}</h3>
                            <p className="text-sm text-white/60">
                                Pembayaran berlaku setiap {paymentPeriodMonths} bulan untuk menjaga layanan tetap optimal.
                            </p>
                        </div>
                    </article>
                    <article className="panel-muted px-6 py-6">
                        <div className="flex h-full flex-col gap-4">
                            <span className={badgeClasses}>Status</span>
                            <h3
                                className={`text-2xl font-semibold ${
                                    paidThisPeriod ? 'text-emerald-200' : 'text-rose-200'
                                }`}
                            >
                                {paidThisPeriod ? 'Sudah Bayar' : 'Belum Bayar'}
                            </h3>
                            <p className="text-sm text-white/60">
                                {paidThisPeriod
                                    ? 'Terima kasih. Anda telah menyelesaikan kewajiban untuk periode berjalan.'
                                    : 'Segera selesaikan pembayaran agar layanan lingkungan tetap berjalan lancar.'}
                            </p>
                        </div>
                    </article>
                </section>

                {!isAdmin && (
                    <section className="panel-muted px-6 py-8 space-y-6">
                        {paidThisPeriod && (
                            <div className="rounded-2xl border border-sky-400/30 bg-sky-500/15 px-5 py-4 text-sm text-sky-100 shadow-[0_20px_50px_-30px_rgba(56,189,248,0.55)]">
                                Anda sudah membayar untuk periode ini. Pembayaran ulang akan memperbarui tanggal dan menggantikan nominal yang ada.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-3">
                                <span className={badgeClasses}>Nominal Tetap</span>
                                <div className="rounded-[1.75rem] border border-white/12 bg-white/10 px-6 py-5 shadow-[0_25px_65px_-40px_rgba(37,99,235,0.9)]">
                                    <div className="text-sm text-white/60">Jumlah yang akan dibayarkan</div>
                                    <div className="mt-2 text-4xl font-semibold text-white">{formatIDR(fixedAmount)}</div>
                                    <p className="mt-3 text-xs text-white/50">
                                        Pembayaran ini tercatat otomatis dan dapat diakses pada riwayat kapan pun diperlukan.
                                    </p>
                                </div>
                                {errors.amount && <p className="text-xs text-rose-300">{errors.amount}</p>}
                            </div>

                            <input type="hidden" name="amount" value={data.amount} />

                            <div className="flex flex-wrap items-center gap-3">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Memproses...' : 'Bayar Sekarang'}
                                </PrimaryButton>
                                <Link href={route('dashboard')} className={navLinkClass}>
                                    Kembali ke Dasbor
                                </Link>
                            </div>
                        </form>
                    </section>
                )}

                {pendingProof && (
                    <section className="panel-muted px-6 py-8 space-y-5">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white">Unggah Bukti Transfer</h3>
                            <p className="text-sm text-white/60">
                                Kami mencatat pembayaran Anda. Mohon unggah foto bukti transfer untuk membantu admin melakukan verifikasi.
                            </p>
                            <blockquote className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm italic text-white/70">
                                "Jangan lupa unggah bukti pembayaran Anda agar verifikasi iuran dapat diproses lebih cepat."
                            </blockquote>
                        </div>

                        <form onSubmit={submitProof} encType="multipart/form-data" className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                                    Bukti Transfer (Foto)
                                </label>
                                <input
                                    ref={proofInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-sky-500/90 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-white hover:border-white/25"
                                    onChange={handleProofChange}
                                />
                                <p className="text-xs text-white/50">Unggah foto dalam format JPG/PNG, maksimal 5MB.</p>
                                {proofForm.data.proof && (
                                    <div className="text-xs text-white/60">File dipilih: {proofForm.data.proof.name}</div>
                                )}
                                {proofForm.errors.proof && (
                                    <p className="text-xs text-rose-300">{proofForm.errors.proof}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <PrimaryButton type="submit" disabled={proofForm.processing}>
                                    {proofForm.processing ? 'Mengunggah...' : 'Simpan Bukti'}
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={() => proofInputRef.current?.click()}>
                                    Pilih Ulang File
                                </SecondaryButton>
                            </div>
                        </form>
                    </section>
                )}

                <section className="panel-muted px-6 py-8 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Riwayat Pembayaran</h3>
                            <p className="text-sm text-white/60">Semua transaksi tertata rapi sebagai arsip transparan komunitas.</p>
                        </div>
                        <span className={badgeClasses}>Rekaman</span>
                    </div>

                    {Array.isArray(lastPayments) && lastPayments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
                                <thead>
                                    <tr className="text-xs uppercase tracking-[0.25em] text-white/40">
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">Nominal</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Bukti</th>
                                        <th className="px-4 py-3 text-left">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {lastPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/6">
                                            <td className="px-4 py-3">
                                                {p.paid_at
                                                    ? new Date(p.paid_at).toLocaleString('id-ID', {
                                                          dateStyle: 'medium',
                                                          timeStyle: 'short',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3">{formatIDR(p.amount)}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        p.paid ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60'
                                                    }`}
                                                >
                                                    {p.paid ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.proof_url ? (
                                                    <a
                                                        href={p.proof_url}
                                                        className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300 transition hover:text-sky-100"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Lihat
                                                    </a>
                                                ) : (
                                                    <span className="text-white/40">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.id ? (
                                                    <a
                                                        href={route('iuran.invoice', p.id, false)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300 transition hover:text-emerald-100"
                                                    >
                                                        PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-white/40">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                            Belum ada riwayat pembayaran.
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
