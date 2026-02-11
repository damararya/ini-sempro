<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; background: #f1f5f9; }
        .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .header { background: #0f172a; padding: 24px 30px; }
        .header h1 { color: #ffffff; font-size: 18px; margin: 0; }
        .body { padding: 28px 30px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .footer { padding: 16px 30px; background: #f8fafc; font-size: 12px; color: #94a3b8; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
        th { background: #f8fafc; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ env('COMMUNITY_NAME', 'Iuran Warga') }}</h1>
        </div>
        <div class="body">
            <p>Yth. <strong>{{ $user->name }}</strong>,</p>

            <p>
                Ini adalah pengingat bahwa batas waktu pembayaran iuran warga periode ini
                akan berakhir dalam <strong>3 hari</strong> pada tanggal
                <strong>{{ $deadline->format('d M Y') }}</strong>.
            </p>

            <p>Iuran yang <strong>belum dibayar</strong>:</p>

            <table>
                <thead>
                    <tr>
                        <th>Jenis Iuran</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($unpaidTypes as $type)
                        <tr>
                            <td>{{ $type === 'sampah' ? 'Iuran Sampah' : 'Iuran Ronda' }}</td>
                            <td><span class="badge badge-red">Belum Bayar</span></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <p>
                Nominal iuran: <strong>Rp {{ number_format(\App\Models\Iuran::FIXED_AMOUNT, 0, ',', '.') }}</strong> per jenis.
            </p>

            <p>Silakan segera lakukan pembayaran melalui aplikasi agar status iuran Anda tercatat dengan baik.</p>

            <p>Terima kasih atas kerjasamanya.</p>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
                Salam,<br>
                {{ env('TREASURER_NAME', 'Bendahara') }}
            </p>
        </div>
        <div class="footer">
            Email ini dikirim otomatis oleh sistem. Jika Anda sudah membayar, harap abaikan pesan ini.
        </div>
    </div>
</body>
</html>
