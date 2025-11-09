import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (event) => {
        event.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Hapus Akun</h2>
                <p className="text-sm text-white/60">
                    Menghapus akun akan menghilangkan seluruh data terkait secara permanen. Pastikan Anda telah mengunduh atau
                    menyimpan informasi penting sebelum melanjutkan.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>Hapus Akun</DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="space-y-6 bg-[#070c24] px-7 py-8 text-white">
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold">Konfirmasi Penghapusan</h2>
                        <p className="text-sm text-white/60">
                            Setelah akun dihapus, tidak ada cara untuk memulihkan data. Masukkan kata sandi untuk melanjutkan proses ini.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Kata Sandi" className="text-xs uppercase tracking-[0.25em] text-white/40" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            isFocused
                            placeholder="Masukkan kata sandi"
                        />

                        <InputError message={errors.password} className="text-xs text-rose-300" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <DangerButton disabled={processing}>Hapus Akun</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
