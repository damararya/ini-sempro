<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>Invoice Iuran</title>
        <style>
            body {
                font-family: DejaVu Sans, sans-serif;
                font-size: 12px;
                color: #0f172a;
            }
            h1 {
                font-size: 20px;
                margin: 0 0 4px;
            }
            h2 {
                font-size: 14px;
                margin: 16px 0 8px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th,
            td {
                border: 1px solid #e2e8f0;
                padding: 6px 8px;
                vertical-align: top;
            }
            th {
                background: #f8fafc;
                text-align: left;
            }
            .meta {
                color: #475569;
                font-size: 10px;
                margin-bottom: 8px;
            }
            .section {
                margin-top: 14px;
            }
            .muted {
                color: #64748b;
            }
            .badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 999px;
                font-size: 10px;
                font-weight: 700;
                background: #e2e8f0;
                color: #0f172a;
            }
            .badge.paid {
                background: #dcfce7;
                color: #166534;
            }
            .badge.unpaid {
                background: #fee2e2;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        @php
            $formatIdr = fn ($value) => 'Rp ' . number_format($value ?? 0, 0, ',', '.');
            $typeLabel = $iuran->type === 'sampah' ? 'Iuran Sampah' : 'Iuran Ronda';
            $invoiceNumber = $iuran->order_id ?: sprintf('IUR-%s', $iuran->id);
            $statusLabel = $iuran->paid ? 'Lunas' : 'Belum Lunas';
            $createdAt = optional($iuran->created_at)->format('d M Y H:i');
            $paidAt = optional($iuran->paid_at)->format('d M Y H:i');
        @endphp

        <h1>Invoice Iuran</h1>
        <div class="meta">
            Nomor Invoice: {{ $invoiceNumber }} | Dicetak: {{ $generatedAt->format('d M Y H:i') }}
        </div>

        <div class="section">
            <h2>Informasi Warga</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Nama</th>
                        <td>{{ $user?->name ?? '-' }}</td>
                        <th>Email</th>
                        <td>{{ $user?->email ?? '-' }}</td>
                    </tr>
                    <tr>
                        <th>NIK</th>
                        <td>{{ $user?->nik ?? '-' }}</td>
                        <th>Status</th>
                        <td>
                            <span class="badge {{ $iuran->paid ? 'paid' : 'unpaid' }}">{{ $statusLabel }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Detail Iuran</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Jenis</th>
                        <td>{{ $typeLabel }}</td>
                        <th>Periode</th>
                        <td>{{ $periodLabel }}</td>
                    </tr>
                    <tr>
                        <th>Nominal</th>
                        <td>{{ $formatIdr($iuran->amount) }}</td>
                        <th>ID Transaksi</th>
                        <td>{{ $iuran->id }}</td>
                    </tr>
                    <tr>
                        <th>Tanggal Dibuat</th>
                        <td>{{ $createdAt ?: '-' }}</td>
                        <th>Tanggal Dibayar</th>
                        <td>{{ $paidAt ?: '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section muted">
            Catatan: Invoice ini dibuat otomatis berdasarkan data pembayaran iuran.
        </div>
    </body>
</html>
