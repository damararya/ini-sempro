<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('iurans', function (Blueprint $table) {
            if (!Schema::hasColumn('iurans', 'order_id')) {
                $table->string('order_id')->nullable()->after('user_id')->unique();
            }

            if (!Schema::hasColumn('iurans', 'proof_path')) {
                $table->string('proof_path')->nullable()->after('paid_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iurans', function (Blueprint $table) {
            if (Schema::hasColumn('iurans', 'proof_path')) {
                $table->dropColumn('proof_path');
            }

            if (Schema::hasColumn('iurans', 'order_id')) {
                $table->dropUnique('iurans_order_id_unique');
                $table->dropColumn('order_id');
            }
        });
    }
};
