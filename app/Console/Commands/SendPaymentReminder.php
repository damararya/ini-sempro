<?php

namespace App\Console\Commands;

use App\Mail\PaymentReminderMail;
use App\Models\Iuran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPaymentReminder extends Command
{
    protected $signature = 'iuran:send-reminder {--force : Paksa kirim tanpa cek H-3}';
    protected $description = 'Kirim email pengingat pembayaran H-3 sebelum akhir periode kuartal';

    /**
     * Menentukan tanggal akhir kuartal berdasarkan tanggal yang diberikan.
     */
    private function quarterEnd(Carbon $date): Carbon
    {
        $month = $date->month;
        $year = $date->year;

        if ($month <= 3) {
            return Carbon::create($year, 3, 31)->endOfDay();
        }
        if ($month <= 6) {
            return Carbon::create($year, 6, 30)->endOfDay();
        }
        if ($month <= 9) {
            return Carbon::create($year, 9, 30)->endOfDay();
        }

        return Carbon::create($year, 12, 31)->endOfDay();
    }

    public function handle(): int
    {
        $today = Carbon::today();
        $endOfQuarter = $this->quarterEnd($today);
        $reminderDate = (clone $endOfQuarter)->subDays(3)->startOfDay();

        $isReminderDay = $today->isSameDay($reminderDate);

        if (!$isReminderDay && !$this->option('force')) {
            $this->info("Hari ini bukan H-3 akhir kuartal (H-3 = {$reminderDate->format('d M Y')}). Tidak ada email yang dikirim.");
            return self::SUCCESS;
        }

        if ($this->option('force')) {
            $this->warn('Mode --force aktif, mengirim reminder meskipun bukan H-3.');
        }

        Iuran::expireStalePayments();

        // Periode kuartal berjalan.
        $quarterStart = (clone $endOfQuarter)->subMonthsNoOverflow(2)->startOfMonth();

        $users = User::query()
            ->where('is_admin', false)
            ->get();

        $sentCount = 0;
        $skippedCount = 0;

        foreach ($users as $user) {
            $unpaidTypes = [];

            foreach (['sampah', 'ronda'] as $type) {
                $hasPaid = Iuran::query()
                    ->where('user_id', $user->id)
                    ->where('type', $type)
                    ->where('paid', true)
                    ->whereNotNull('paid_at')
                    ->whereBetween('paid_at', [$quarterStart, $endOfQuarter])
                    ->exists();

                if (!$hasPaid) {
                    $unpaidTypes[] = $type;
                }
            }

            if (empty($unpaidTypes)) {
                $skippedCount++;
                continue;
            }

            try {
                Mail::to($user->email)->send(new PaymentReminderMail($user, $endOfQuarter, $unpaidTypes));
                $sentCount++;
                $this->line("  Terkirim: {$user->name} ({$user->email}) — belum bayar: " . implode(', ', $unpaidTypes));
            } catch (\Throwable $e) {
                $this->error("  Gagal kirim ke {$user->email}: {$e->getMessage()}");
                Log::error('Payment reminder email failed', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Selesai. Terkirim: {$sentCount}, Dilewati (sudah lunas): {$skippedCount}.");

        Log::info('Payment reminder batch completed', [
            'sent' => $sentCount,
            'skipped' => $skippedCount,
            'quarter_end' => $endOfQuarter->toDateString(),
        ]);

        return self::SUCCESS;
    }
}
