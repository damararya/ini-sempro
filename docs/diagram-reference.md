# Referensi Diagram Aktivitas & Kelas

Dokumen ini merangkum alur utama dan struktur data aplikasi agar pembuatan activity diagram dan class diagram lebih cepat dan akurat.

## Konteks Singkat
- Aplikasi iuran RT/RW berbasis Laravel + Inertia.
- Dua jenis iuran: `sampah` dan `ronda`, nominal tetap `Iuran::FIXED_AMOUNT` (120.000) per `Iuran::PAYMENT_PERIOD_MONTHS` (3) bulan.
- Pembayaran bisa lewat Midtrans (Snap) atau manual dengan unggah bukti transfer.
- Admin memantau iuran, pengeluaran, dan membuat laporan PDF; warga bisa mengajukan proposal seminar (`Sempro`).

## Aktor
- **Warga**: bayar iuran, unggah bukti, unduh invoice, ajukan proposal.
- **Admin**: kelola iuran & bukti, kelola pengeluaran, ekspor laporan transparansi, lihat dashboard admin.
- **Midtrans**: gateway pembayaran; mengirim notifikasi server-to-server.

## Outline Activity Diagram (alur utama)
- **Bayar iuran via Midtrans (UserIuranController@store + MidtransController@notification)**
  1. Warga buka halaman bayar (`GET /iuran/pay/{type}`) → cek periode aktif & status lunas.
  2. Warga kirim permintaan bayar → aplikasi validasi jumlah → buat draft `Iuran` dengan `paid=false` + `order_id`.
  3. Sistem kirim request Snap → redirect ke halaman pembayaran Midtrans.
  4. Pengguna selesai / batal di Midtrans → diarahkan kembali ke `/payment/finish|unfinish|error`.
  5. Midtrans kirim notifikasi → sistem parse `order_id` → tandai `Iuran` `paid=true`, set `paid_at` (juga membuat entri baru jika belum ada).
  6. Dashboard menampilkan status terbaru (panggil `Iuran::expireStalePayments()` sebelum hitung).

- **Bayar iuran manual + unggah bukti (UserIuranController@storeManual/storeProof)**
  1. Warga klik “Bayar manual” → sistem cek apakah ada `Iuran` pending (belum lunas atau tanpa bukti).
  2. Jika aman, buat `Iuran` baru `paid=false`, `proof_path=null`.
  3. Warga unggah bukti (`POST /iuran/proof/{iuran}`) → simpan file di disk `public` → set `paid=true`, `paid_at` now.

- **Admin kelola iuran (IuranController)**
  1. `index`: filter iuran per `type`/`paid`, paginasi, menampilkan `fixedAmount`.
  2. `create/store`: admin membuat iuran manual (boleh langsung `paid=true` dengan `paid_at`).
  3. `edit/update`: ubah data iuran (nominal selalu `FIXED_AMOUNT`).
  4. `destroy`: hapus iuran.
  5. `proof`: admin lihat bukti unggahan.
  6. `exportPdf`: pilih `month/year` → hitung ringkasan per jenis + pengeluaran → render view `reports.iuran-transparency` → download PDF.

- **Admin kelola pengeluaran (ExpenseController)**
  1. `index` dengan filter `type`.
  2. `create/store` dan `edit/update` untuk `type (sampah|ronda)`, `label`, `detail`, `amount`, `spent_at`, `proof_ref`.
  3. `destroy` hapus entri.

- **Proposal seminar (SemproController)**
  1. Warga buka form (`GET /sempro/create`).
  2. Submit judul, deskripsi, kategori → validasi → simpan `Sempro` dengan `author_id` dan `author (email)` → redirect dengan flash message.

- **Dashboard warga/admin (DashboardController, AdminDashboardController)**
  - Warga: tampilkan target bulanan, total terkumpul, status lunas per jenis, riwayat pribadi, riwayat admin (jika role admin).
  - Admin: statistik per bulan + tren 6 bulan (`totalKeseluruhan`, `totalSampah`, `totalRonda`, `totalKeluarga`), daftar keluarga beserta status pernah bayar.

## Outline Class Diagram
- **User**
  - Atribut: `id`, `name`, `email`, `nik`, `password`, `is_admin`, `last_login_at`.
  - Relasi: `hasMany Iuran`.

- **Iuran**
  - Atribut: `id`, `user_id`, `order_id`, `type (sampah|ronda)`, `amount`, `paid`, `paid_at`, `proof_path`.
  - Konstanta: `FIXED_AMOUNT`, `PAYMENT_PERIOD_MONTHS`.
  - Metode penting: `expireStalePayments()`, `getProofUrlAttribute()`, `toHistoryPayload()`, `recentHistoryForUser()`, `recentHistoryForAdmin()`.
  - Relasi: `belongsTo User`.

- **Expense**
  - Atribut: `id`, `type (sampah|ronda)`, `label`, `detail`, `amount`, `spent_at`, `proof_ref`.

- **Sempro**
  - Atribut: `id`, `title`, `description`, `category`, `author`, `author_id`.
  - Relasi: `belongsTo User (author_id)`.

- **Controller (opsional di diagram kelas)**
  - `UserIuranController`: alur bayar manual/Midtrans, unggah bukti, invoice.
  - `MidtransController`: konfigurasi SDK, callback finish/unfinish/error, notifikasi server-to-server.
  - `IuranController`: CRUD admin + ekspor PDF + lihat bukti.
  - `ExpenseController`: CRUD pengeluaran.
  - `DashboardController`, `AdminDashboardController`: agregasi statistik.
  - `SemproController`: formulir & penyimpanan proposal.

## Lokasi Kode Rujukan
- Rute utama: `routes/web.php` (home → `DashboardController@.index`, grup `/admin`, rute pembayaran, callback Midtrans).
- Model: `app/Models/Iuran.php`, `User.php`, `Expense.php`, `Sempro.php`.
- Controller: folder `app/Http/Controllers/` (lihat nama file sesuai alur di atas).
- View PDF: `resources/views/reports/` (invoice & transparansi).

Gunakan poin-poin di atas sebagai swimlane/decision utama saat menggambar activity diagram, dan gunakan daftar kelas + relasi untuk skeleton class diagram. Tambahkan state `paid`/`paid_at`/`proof_path` di cabang keputusan pembayaran supaya mencerminkan logika aktual aplikasi.
