<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class PaymentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Carbon $deadline;
    public array $unpaidTypes;

    /**
     * @param  User     $user         Warga yang belum membayar.
     * @param  Carbon   $deadline     Tanggal akhir periode kuartal.
     * @param  array    $unpaidTypes  Jenis iuran yang belum dibayar (['sampah', 'ronda']).
     */
    public function __construct(User $user, Carbon $deadline, array $unpaidTypes)
    {
        $this->user = $user;
        $this->deadline = $deadline;
        $this->unpaidTypes = $unpaidTypes;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pengingat Pembayaran Iuran — 3 Hari Lagi',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-reminder',
        );
    }
}
