<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['sampah', 'ronda']);
            $table->string('label'); // kategori pengeluaran
            $table->text('detail')->nullable(); // rincian penggunaan
            $table->unsignedBigInteger('amount'); // rupiah
            $table->date('spent_at')->nullable();
            $table->string('proof_ref')->nullable(); // nomor kwitansi / ref
            $table->timestamps();
            $table->index('type');
            $table->index('spent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
