<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sempro') && !Schema::hasTable('sempros')) {
            Schema::rename('sempro', 'sempros');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sempros') && !Schema::hasTable('sempro')) {
            Schema::rename('sempros', 'sempro');
        }
    }
};

