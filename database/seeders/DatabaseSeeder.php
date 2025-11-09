<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // Ensure there is at least 1 admin user for accessing admin dashboard
        if (!User::query()->where('email', 'admin@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'is_admin' => true,
            ]);
        }

        $this->call([
            IuranSeeder::class,
            SemproSeeder::class,
        ]);
    }
}

