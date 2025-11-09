<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sempros', function (Blueprint $table) {
            $table->foreignId('author_id')->nullable()->after('author')->constrained('users')->nullOnDelete();
        });

        // Best-effort backfill: match existing author emails to users
        try {
            DB::table('sempros')
                ->whereNotNull('author')
                ->orderBy('id')
                ->chunkById(100, function ($rows) {
                    foreach ($rows as $row) {
                        $userId = DB::table('users')->where('email', $row->author)->value('id');
                        if ($userId) {
                            DB::table('sempros')->where('id', $row->id)->update(['author_id' => $userId]);
                        }
                    }
                });
        } catch (\Throwable $e) {
            // Ignore backfill errors in environments without the tables seeded
        }
    }

    public function down(): void
    {
        Schema::table('sempros', function (Blueprint $table) {
            if (Schema::hasColumn('sempros', 'author_id')) {
                $table->dropConstrainedForeignId('author_id');
            }
        });
    }
};

