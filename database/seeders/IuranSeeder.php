<?php

namespace Database\Seeders;

use App\Models\Iuran;
use App\Models\User;
use Illuminate\Database\Seeder;

class IuranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            // If there are no users yet, just create some global entries
            Iuran::factory()->create(['type' => 'sampah', 'amount' => 50000, 'paid' => true, 'paid_at' => now()]);
            Iuran::factory()->create(['type' => 'ronda', 'amount' => 30000, 'paid' => true, 'paid_at' => now()]);
            Iuran::factory()->create(['type' => 'sampah', 'amount' => 50000, 'paid' => false]);
            return;
        }

        foreach ($users as $user) {
            Iuran::factory(4)->create(['user_id' => $user->id]);
        }
    }
}
