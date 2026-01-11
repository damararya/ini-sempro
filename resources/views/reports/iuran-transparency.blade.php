<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>Transparansi Iuran</title>
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
                margin: 18px 0 8px;
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
            ul {
                margin: 0;
                padding-left: 16px;
            }
        </style>
    </head>
    <body>
        @php
            $formatIdr = fn ($value) => 'Rp ' . number_format($value ?? 0, 0, ',', '.');
        @endphp

        <h1>Transparansi Iuran</h1>
        <div class="meta">Periode: {{ $periodLabel }} | Dicetak: {{ $generatedAt->format('d M Y H:i') }}</div>

        <div class="section">
            <h2>Ringkasan Pemasukan</h2>
            <table>
                <thead>
                    <tr>
                        <th>Jenis</th>
                        <th>Jumlah Transaksi</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Keseluruhan</td>
                        <td>{{ $summary['count'] }}</td>
                        <td>{{ $formatIdr($summary['total']) }}</td>
                    </tr>
                    <tr>
                        <td>Iuran Sampah</td>
                        <td>{{ $summary['sampah_count'] }}</td>
                        <td>{{ $formatIdr($summary['sampah_total']) }}</td>
                    </tr>
                    <tr>
                        <td>Iuran Ronda</td>
                        <td>{{ $summary['ronda_count'] }}</td>
                        <td>{{ $formatIdr($summary['ronda_total']) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Rincian Pengeluaran (Kategori)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Jenis Iuran</th>
                        <th>Kategori Pengeluaran</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Iuran Sampah</td>
                        <td>
                            @if (!empty($expenses['sampah']))
                                <ul>
                                    @foreach ($expenses['sampah'] as $item)
                                        <li>{{ $item['label'] ?? '-' }}</li>
                                    @endforeach
                                </ul>
                            @else
                                <span class="muted">Belum ada kategori.</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>Iuran Ronda</td>
                        <td>
                            @if (!empty($expenses['ronda']))
                                <ul>
                                    @foreach ($expenses['ronda'] as $item)
                                        <li>{{ $item['label'] ?? '-' }}</li>
                                    @endforeach
                                </ul>
                            @else
                                <span class="muted">Belum ada kategori.</span>
                            @endif
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section muted">
            Catatan: Kategori pengeluaran dapat disesuaikan di config/iuran_report.php.
        </div>
    </body>
</html>
