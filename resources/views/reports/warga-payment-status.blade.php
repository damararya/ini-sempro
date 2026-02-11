<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>Laporan Status Pembayaran Iuran Warga</title>
        <style>
            body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #0f172a; }
            h1 { font-size: 20px; margin: 0 0 6px; }
            h2 { font-size: 15px; margin: 16px 0 8px; }
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
            .badge-lunas {
                background: #dcfce7;
                color: #166534;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
            }
            .badge-belum {
                background: #fee2e2;
                color: #991b1b;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        @php
            $orgName = env('COMMUNITY_NAME', 'Iuran Warga');
            $total = $summary['total'];
            $pctSampah = $total > 0 ? round($summary['sampah_paid'] / $total * 100) : 0;
            $pctRonda = $total > 0 ? round($summary['ronda_paid'] / $total * 100) : 0;
        @endphp

        <h1>LAPORAN STATUS PEMBAYARAN IURAN WARGA</h1>
        <p class="muted">Periode {{ $periodMonths }} Bulan: {{ $periodLabel }} | Dicetak: {{ $generatedAt->format('d M Y H:i') }}</p>
        <p><strong>{{ $orgName }}</strong></p>

        {{-- Ringkasan --}}
        <div class="section">
            <h2>Ringkasan</h2>
            <table>
                <thead>
                    <tr>
                        <th>Keterangan</th>
                        <th class="text-center">Iuran Sampah</th>
                        <th class="text-center">Iuran Ronda</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Warga</td>
                        <td class="text-center" colspan="2">{{ $total }}</td>
                    </tr>
                    <tr>
                        <td>Sudah Bayar</td>
                        <td class="text-center">{{ $summary['sampah_paid'] }} ({{ $pctSampah }}%)</td>
                        <td class="text-center">{{ $summary['ronda_paid'] }} ({{ $pctRonda }}%)</td>
                    </tr>
                    <tr>
                        <td>Belum Bayar</td>
                        <td class="text-center">{{ $summary['sampah_unpaid'] }} ({{ 100 - $pctSampah }}%)</td>
                        <td class="text-center">{{ $summary['ronda_unpaid'] }} ({{ 100 - $pctRonda }}%)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {{-- Daftar Warga --}}
        <div class="section">
            <h2>Daftar Status Pembayaran</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 6%;">No</th>
                        <th style="width: 30%;">Nama Warga</th>
                        <th style="width: 24%;">NIK</th>
                        <th style="width: 20%;" class="text-center">Iuran Sampah</th>
                        <th style="width: 20%;" class="text-center">Iuran Ronda</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($warga as $index => $w)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>{{ $w['name'] }}</td>
                            <td>{{ $w['nik'] ?? '-' }}</td>
                            <td class="text-center">
                                @if ($w['paid_sampah'])
                                    <span class="badge-lunas">Lunas</span>
                                @else
                                    <span class="badge-belum">Belum Bayar</span>
                                @endif
                            </td>
                            <td class="text-center">
                                @if ($w['paid_ronda'])
                                    <span class="badge-lunas">Lunas</span>
                                @else
                                    <span class="badge-belum">Belum Bayar</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center muted">Belum ada data warga.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{-- Tanda tangan --}}
        <div class="section" style="margin-top: 30px;">
            <table>
                <tr>
                    <th style="width: 50%;">Bendahara</th>
                    <th style="width: 50%;">Ketua RT/RW</th>
                </tr>
                <tr>
                    <td style="height: 60px;">&nbsp;</td>
                    <td></td>
                </tr>
                <tr>
                    <td>{{ env('TREASURER_NAME', 'Bendahara') }}</td>
                    <td>{{ env('CHAIRMAN_NAME', '__________________') }}</td>
                </tr>
            </table>
        </div>

        <p class="small" style="margin-top: 14px;">Dokumen ini dicetak secara otomatis oleh sistem.</p>
    </body>
</html>
