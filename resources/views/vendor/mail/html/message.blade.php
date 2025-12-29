@props([
    'header',
    'footer',
    'subcopy',
])
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }}</title>
</head>
<body style="margin:0;background-color:#040112;padding:24px;font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;border-spacing:0;">
        <tr>
            <td style="padding:0;">
                <div style="
                    border-radius:36px;
                    border:1px solid rgba(255,255,255,0.08);
                    background:linear-gradient(145deg,rgba(255,255,255,0.1),rgba(11,15,44,0.9));
                    padding:32px;
                    box-shadow:0 40px 120px -60px rgba(8,10,42,0.9);
                    color:#e2e8f0;
                    position:relative;
                    overflow:hidden;
                ">
                    <div style="position:absolute;inset:0;pointer-events:none;">
                        <div style="position:absolute;width:360px;height:360px;border-radius:999px;background:radial-gradient(circle,rgba(59,130,246,0.35),transparent 65%);top:-140px;left:-120px;filter:blur(60px);"></div>
                        <div style="position:absolute;width:420px;height:420px;border-radius:999px;background:radial-gradient(circle,rgba(168,85,247,0.25),transparent 70%);bottom:-180px;right:-140px;filter:blur(60px);"></div>
                    </div>

                    <div style="position:relative;z-index:2;">
                        @isset($header)
                            <div style="margin-bottom:24px;">
                                {{ $header }}
                            </div>
                        @endisset

                        <div style="background-color:rgba(6,12,36,0.85);border-radius:24px;padding:28px;border:1px solid rgba(255,255,255,0.05);">
                            <div style="font-size:16px;line-height:1.7;color:#f8fafc;">
                                {{ Illuminate\Mail\Markdown::parse($slot) }}
                            </div>
                        </div>

                        @isset($subcopy)
                            <div style="margin-top:28px;border-radius:22px;background-color:rgba(148,163,184,0.08);padding:18px 22px;font-size:13px;color:#cbd5f5;line-height:1.6;border:1px solid rgba(148,163,184,0.15);">
                                {{ Illuminate\Mail\Markdown::parse($subcopy) }}
                            </div>
                        @endisset

                        @isset($footer)
                            <div style="margin-top:32px;text-align:center;font-size:12px;color:#94a3b8;">
                                {{ $footer }}
                            </div>
                        @endisset
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
