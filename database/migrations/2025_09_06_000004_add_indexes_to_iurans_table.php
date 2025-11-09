<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('iurans', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('type');
            $table->index('paid');
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('iurans', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['type']);
            $table->dropIndex(['paid']);
            $table->dropIndex(['paid_at']);
        });
    }
};

