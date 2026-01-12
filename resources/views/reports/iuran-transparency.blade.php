<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>Laporan Transparansi Iuran</title>
        <style>
            body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #0f172a; }
            h1 { font-size: 20px; margin: 0 0 6px; }
            h2 { font-size: 15px; margin: 16px 0 8px; }
            h3 { font-size: 13px; margin: 12px 0 6px; }
            p { margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
            th { background: #f8fafc; text-align: left; }
            .meta { color: #475569; font-size: 10px; margin-bottom: 10px; }
            .muted { color: #64748b; }
            .section { margin-top: 12px; }
            .small { font-size: 10px; color: #475569; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .page-break { page-break-after: always; }
        </style>
    </head>
    <body>
        @php
            $formatIdr = fn ($value) => 'Rp ' . number_format((int) $value, 0, ',', '.');
            $orgName = env('COMMUNITY_NAME', 'Iuran Warga');
            $orgContact = env('COMMUNITY_CONTACT', '-');
            $orgEmail = env('COMMUNITY_EMAIL', config('mail.from.address'));
        @endphp

        {{-- Halaman 1: Ringkasan keseluruhan --}}
        <h1>LAPORAN TRANSPARANSI ARUS DANA</h1>
        <p class="muted">Periode: {{ $periodLabel }} | Dicetak: {{ $generatedAt->format('d M Y H:i') }}</p>
        <p><strong>{{ $orgName }}</strong><br>Kontak: {{ $orgContact }} @if($orgEmail) | Email: {{ $orgEmail }} @endif</p>

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

        <p class="small" style="margin-top:14px;">Halaman 1 dari 3</p>
        <div class="page-break"></div>

        {{-- Halaman 2 dan 3: per jenis iuran --}}
        @foreach (['sampah' => 'Iuran Sampah', 'ronda' => 'Iuran Ronda'] as $typeKey => $typeLabel)
            @php
                $txs = $transactionsByType[$typeKey] ?? [];
                $totalIn = array_sum(array_column($txs, 'amount'));
                $expensesForType = $expenses[$typeKey] ?? [];
                $totalExpense = array_sum(array_column($expensesForType, 'amount'));
            @endphp

            <h1>LAPORAN TRANSPARANSI ARUS DANA</h1>
            <p class="muted">{{ $typeLabel }} · Periode: {{ $periodLabel }}</p>
            <p><strong>{{ $orgName }}</strong><br>Disusun oleh: {{ env('TREASURER_NAME', 'Bendahara') }} | Kontak: {{ $orgContact }}</p>

            <table style="margin-top:10px;">
                <tr>
                    <th style="width:25%;">Saldo Awal</th>
                    <td style="width:25%;">{{ $formatIdr(0) }}</td>
                    <th style="width:25%;">Total Pemasukan</th>
                    <td style="width:25%;">{{ $formatIdr($totalIn) }}</td>
                </tr>
                <tr>
                    <th>Total Pengeluaran</th>
                    <td>{{ $formatIdr($totalExpense) }}</td>
                    <th>Saldo Akhir</th>
                    <td>{{ $formatIdr($totalIn - $totalExpense) }}</td>
                </tr>
            </table>

            <div class="section">
                <h3>A. Rincian Pemasukan</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width:12%;">Tanggal</th>
                            <th style="width:22%;">Sumber</th>
                            <th style="width:26%;">Keterangan</th>
                            <th style="width:20%;">Jumlah (Rp)</th>
                            <th style="width:20%;">Bukti/Ref</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($txs as $row)
                            <tr>
                                <td>{{ $row['date'] ?? '-' }}</td>
                                <td>{{ $row['source'] ?? '-' }}</td>
                                <td>{{ $row['note'] ?? '-' }}</td>
                                <td class="text-right">{{ $formatIdr($row['amount'] ?? 0) }}</td>
                                <td>
                                    @if (!empty($row['proof_url']))
                                        {{ $row['proof_url'] }}
                                    @else
                                        -
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center muted">Belum ada pemasukan pada periode ini.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h3>B. Rincian Pengeluaran (Penggunaan Dana)</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width:12%;">Tanggal</th>
                            <th style="width:22%;">Kategori</th>
                            <th style="width:26%;">Rincian</th>
                            <th style="width:20%;">Jumlah (Rp)</th>
                            <th style="width:20%;">Bukti</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if (!empty($expensesForType))
                            @foreach ($expensesForType as $item)
                                <tr>
                                    <td>{{ $item['date'] ?? '-' }}</td>
                                    <td>{{ $item['label'] ?? '-' }}</td>
                                    <td>{{ $item['detail'] ?? 'Rincian penggunaan' }}</td>
                                    <td class="text-right">{{ $formatIdr($item['amount'] ?? 0) }}</td>
                                    <td>{{ $item['proof_ref'] ?? '-' }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="5" class="text-center muted">Belum ada data pengeluaran.</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h3>C. Ringkasan Alokasi Pengeluaran (per Kategori)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th style="width:25%;">Jumlah (Rp)</th>
                            <th style="width:35%;">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if (!empty($expensesForType))
                            @foreach ($expensesForType as $item)
                                <tr>
                                    <td>{{ $item['label'] ?? '-' }}</td>
                                    <td class="text-right">{{ $formatIdr($item['amount'] ?? 0) }}</td>
                                    <td class="muted">{{ $item['detail'] ?? 'Opsional' }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="3" class="text-center muted">Belum ada alokasi pengeluaran.</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>

            <div class="section">
                <table>
                    <tr>
                        <th style="width:33%;">Bendahara</th>
                        <th style="width:33%;">Ketua RT/RW</th>
                        <th style="width:34%;">Perwakilan Warga (opsional)</th>
                    </tr>
                    <tr>
                        <td style="height:60px;">&nbsp;</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{{ env('TREASURER_NAME', 'Bendahara') }}</td>
                        <td>{{ env('CHAIRMAN_NAME', '__________________') }}</td>
                        <td>{{ env('COMMUNITY_REP', '__________________') }}</td>
                    </tr>
                </table>
            </div>

            <p class="small">Halaman {{ $loop->index + 2 }} dari 3</p>

            @if (! $loop->last)
                <div class="page-break"></div>
            @endif
        @endforeach
    </body>
</html>
