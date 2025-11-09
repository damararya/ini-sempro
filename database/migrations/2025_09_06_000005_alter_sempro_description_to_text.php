<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['mysql', 'pgsql'])) {
            Schema::table('sempros', function (Blueprint $table) {
                $table->text('description')->change();
            });
        } else {
            // On sqlite and other drivers, skip altering column type to avoid requiring DBAL
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['mysql', 'pgsql'])) {
            Schema::table('sempros', function (Blueprint $table) {
                $table->string('description')->change();
            });
        } else {
            // No-op for sqlite/others
        }
    }
};
