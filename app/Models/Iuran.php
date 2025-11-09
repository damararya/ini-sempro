<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Iuran extends Model
{
    use HasFactory;

    /**
     * Nominal iuran tetap per periode (dalam rupiah).
     */
    public const FIXED_AMOUNT = 120_000;

    /**
     * Lama satu periode pembayaran dalam bulan.
     */
    public const PAYMENT_PERIOD_MONTHS = 3;

    protected $fillable = [
        'user_id',
        'order_id',
        'type', // sampah | ronda
        'amount',
        'paid',
        'paid_at',
        'proof_path',
    ];

    protected $casts = [
        'paid' => 'boolean',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'proof_url',
    ];

    /**
     * Menandai pembayaran lama sebagai belum lunas saat periode aktif sudah lewat.
     */
    public static function expireStalePayments(): void
    {
        // Hitung tanggal batas berdasarkan panjang periode iuran.
        $threshold = Carbon::now()->subMonthsNoOverflow(static::PAYMENT_PERIOD_MONTHS);

        static::query()
            ->where('paid', true)
            ->whereNotNull('paid_at')
            ->where('paid_at', '<=', $threshold)
            ->update(['paid' => false]);
    }

    /**
     * Relasi ke pengguna yang melakukan pembayaran.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Menghasilkan URL publik untuk bukti pembayaran yang tersimpan.
     */
    public function getProofUrlAttribute(): ?string
    {
        if (!$this->proof_path) {
            return null;
        }

        $user = auth()->user();

        if ($user) {
            if ($user->can('access-admin')) {
                return route('admin.iurans.proof', $this);
            }

            if ($user->id === $this->user_id) {
                return route('iuran.pay.proof.show', $this);
            }
        }

        return Storage::url($this->proof_path);
    }

    /**
     * Membentuk payload riwayat pembayaran seragam untuk frontend.
     */
    public function toHistoryPayload(bool $includeUser = false): array
    {
        $payload = [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'amount' => (int) $this->amount,
            'paid' => (bool) $this->paid,
            'paid_at' => optional($this->paid_at)->toISOString(),
            'proof_url' => $this->proof_url,
        ];

        if ($includeUser) {
            $user = $this->user;
            $payload['user'] = $user
                ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
                : null;
        }

        return $payload;
    }

    /**
     * Mengambil riwayat pembayaran terbaru untuk pengguna tertentu dan jenis iuran.
     */
    public static function recentHistoryForUser(User $user, ?string $type = null, int $limit = 6): array
    {
        return static::query()
            ->where('user_id', $user->id)
            ->when($type, fn ($query) => $query->where('type', $type))
            ->orderByDesc('paid_at')
            ->orderByDesc('updated_at')
            ->take($limit)
            ->get()
            ->map(fn (self $iuran) => $iuran->toHistoryPayload())
            ->all();
    }

    /**
     * Mengambil riwayat pembayaran terbaru versi admin lengkap dengan data user.
     */
    public static function recentHistoryForAdmin(int $limit = 6): array
    {
        return static::query()
            ->with('user:id,name,email')
            ->orderByDesc('paid_at')
            ->orderByDesc('updated_at')
            ->take($limit)
            ->get()
            ->map(fn (self $iuran) => $iuran->toHistoryPayload(includeUser: true))
            ->all();
    }
}
