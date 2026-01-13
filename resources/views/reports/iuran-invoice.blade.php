<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>Invoice Iuran Warga</title>
        <style>
            body {
                font-family: DejaVu Sans, sans-serif;
                font-size: 12px;
                color: #0f172a;
            }
            h1, h2, h3 { margin: 0; padding: 0; }
            h1 { font-size: 22px; margin-bottom: 6px; }
            h2 { font-size: 16px; margin-bottom: 6px; }
            h3 { font-size: 13px; margin-bottom: 4px; }
            p { margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 8px; vertical-align: top; }
            .bordered th, .bordered td { border: 1px solid #d9e2ec; }
            .muted { color: #64748b; font-size: 11px; }
            .section { margin-top: 12px; }
            .grid { display: table; width: 100%; }
            .col { display: table-cell; vertical-align: top; }
            .col-2 { width: 50%; }
            .tag { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; background: #e2e8f0; color: #0f172a; }
            .tag.paid { background: #dcfce7; color: #166534; }
            .tag.unpaid { background: #fee2e2; color: #991b1b; }
            .hr { height: 1px; background: linear-gradient(90deg, transparent, #cbd5e1, transparent); margin: 12px 0; }
            .table-header { background: #f8fafc; font-weight: 700; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .small { font-size: 10px; color: #475569; }
        </style>
    </head>
    <body>
        @php
            $formatIdr = fn ($value) => 'Rp ' . number_format((int) $value, 0, ',', '.');
            $typeLabel = $iuran->type === 'sampah' ? 'Iuran Sampah' : 'Iuran Ronda';
            $invoiceNumber = $iuran->order_id ?: sprintf('IUR-%s', $iuran->id);
            $statusLabel = $iuran->paid ? 'Lunas' : 'Belum Lunas';
            $issueDate = optional($iuran->paid_at ?? $iuran->created_at)->format('d/m/Y') ?: '-';
            $dueDate = optional(now()->copy()->endOfMonth())->format('d/m/Y');
            $createdAt = optional($iuran->created_at)->format('d M Y H:i');
            $paidAt = optional($iuran->paid_at)->format('d M Y H:i');
            $orgName = env('COMMUNITY_NAME', 'Iuran Warga');
            $orgContact = env('COMMUNITY_CONTACT', '-');
            $orgEmail = env('COMMUNITY_EMAIL', config('mail.from.address'));
            $treasurer = env('TREASURER_NAME', 'Bendahara');
            $treasurerPhone = env('TREASURER_PHONE', '-');
            $paymentChannel = env('PAYMENT_CHANNEL', 'Rekening/QRIS belum diisi');
        @endphp

        <h1>INVOICE IURAN WARGA</h1>
        <p class="muted">Untuk iuran sampah, iuran ronda, dan iuran warga lainnya</p>
        <div class="grid">
            <div class="col col-2">
                <h3>{{ $orgName }}</h3>
                <p class="muted">Kontak: {{ $orgContact }} @if($orgEmail) &nbsp;|&nbsp; Email: {{ $orgEmail }} @endif</p>
            </div>
            <div class="col col-2" style="text-align: right;">
                <div class="tag {{ $iuran->paid ? 'paid' : 'unpaid' }}">{{ $statusLabel }}</div>
                <p class="small">Dicetak: {{ $generatedAt->format('d M Y H:i') }}</p>
            </div>
        </div>

        <div class="section grid">
            <div class="col col-2">
                <h3>Detail Invoice</h3>
                <table>
                    <tr><td class="muted">Nomor</td><td>{{ $invoiceNumber }}</td></tr>
                    <tr><td class="muted">Tanggal</td><td>{{ $issueDate }}</td></tr>
                    <tr><td class="muted">Jatuh Tempo</td><td>{{ $dueDate }}</td></tr>
                    <tr><td class="muted">Periode</td><td>{{ $periodLabel }}</td></tr>
                </table>
            </div>
            <div class="col col-2">
                <div style="display: table; width: 100%;">
                    <div style="display: table-cell; width: 50%; vertical-align: top;">
                        <h3>Ditagihkan kepada</h3>
                        <p><strong>Nama:</strong> {{ $user?->name ?? '-' }}</p>
                        <p><strong>Email:</strong> {{ $user?->email ?? '-' }}</p>
                        <p><strong>NIK:</strong> {{ $user?->nik ?? '-' }}</p>
                    </div>
                    <div style="display: table-cell; width: 50%; vertical-align: top;">
                        <h3>Diterbitkan oleh</h3>
                        <p><strong>Bendahara:</strong> {{ $treasurer }}</p>
                        <p><strong>Jabatan:</strong> Bendahara/Pengurus</p>
                        <p><strong>Rekening/QRIS:</strong> {{ $paymentChannel }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <table class="bordered">
                <thead>
                    <tr class="table-header">
                        <th style="width: 8%;">No</th>
                        <th>Deskripsi</th>
                        <th style="width: 10%;">Qty</th>
                        <th style="width: 20%;">Harga Satuan</th>
                        <th style="width: 20%;">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-center">1</td>
                        <td>{{ $typeLabel }} Periode {{ $periodLabel }}</td>
                        <td class="text-center">1</td>
                        <td class="text-right">{{ $formatIdr($iuran->amount) }}</td>
                        <td class="text-right">{{ $formatIdr($iuran->amount) }}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="4" class="text-right">Subtotal</th>
                        <th class="text-right">{{ $formatIdr($iuran->amount) }}</th>
                    </tr>
                    <tr>
                        <th colspan="4" class="text-right">Denda (opsional)</th>
                        <th class="text-right">{{ $formatIdr(0) }}</th>
                    </tr>
                    <tr>
                        <th colspan="4" class="text-right">Total Tagihan</th>
                        <th class="text-right">{{ $formatIdr($iuran->amount) }}</th>
                    </tr>
                    <tr>
                        <th colspan="4" class="text-right">Sudah Dibayar</th>
                        <th class="text-right">{{ $iuran->paid ? $formatIdr($iuran->amount) : $formatIdr(0) }}</th>
                    </tr>
                    <tr>
                        <th colspan="4" class="text-right">Sisa Tagihan</th>
                        <th class="text-right">{{ $iuran->paid ? $formatIdr(0) : $formatIdr($iuran->amount) }}</th>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="section grid">
            <div class="col col-2">
                <h3>Tanda tangan</h3>
                <div class="hr"></div>
                <p><strong>Bendahara</strong><br>{{ $treasurer }}</p>
            </div>
            <div class="col col-2" style="text-align: right;">
                <p class="small">ID Transaksi: {{ $iuran->id }} | Dibuat: {{ $createdAt ?: '-' }} | Dibayar: {{ $paidAt ?: '-' }}</p>
            </div>
        </div>

        <div class="text-center small" style="margin-top: 16px;">
            Halaman 1 dari 1
        </div>
    </body>
</html>
