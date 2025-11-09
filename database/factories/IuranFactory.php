<?php

namespace Database\Factories;

use App\Models\Iuran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Iuran>
 */
class IuranFactory extends Factory
{
    protected $model = Iuran::class;

    public function definition(): array
    {
        $paid = $this->faker->boolean(70);
        $paidAt = $paid ? $this->faker->dateTimeBetween('-6 months', 'now') : null;

        return [
            'user_id' => null,
            'order_id' => $this->faker->uuid(),
            'type' => $this->faker->randomElement(['sampah', 'ronda']),
            'amount' => Iuran::FIXED_AMOUNT,
            'paid' => $paid,
            'paid_at' => $paidAt,
            'proof_path' => $paid ? 'payment-proofs/sample.jpg' : null,
        ];
    }
}
