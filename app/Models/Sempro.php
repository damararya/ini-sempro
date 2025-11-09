<?php
// Membuka tag PHP agar interpreter mengenali script ini

namespace App\Models;
// Menetapkan namespace agar kelas berada di struktur App\Models

use Illuminate\Database\Eloquent\Factories\HasFactory;
// Mengimpor trait HasFactory untuk mempermudah pembuatan factory data
use Illuminate\Database\Eloquent\Model;
// Mengimpor kelas Model dasar dari Eloquent
use App\Models\User;
// Mengimpor model User untuk relasi author

class Sempro extends Model
// Mendefinisikan kelas Sempro yang mewarisi fitur dari Eloquent Model
{
    use HasFactory;
    // Mengaktifkan trait HasFactory agar bisa membuat factory Sempro

    /**
     * Kolom yang dapat diisi melalui mass-assignment.
     */
    protected $fillable = [
        'title',       // Mendaftarkan judul proposal sebagai kolom yang bisa diisi massal
        'description', // Mengizinkan deskripsi proposal diisi massal
        'category',    // Mengizinkan kategori proposal diisi massal
        'author',      // Mengizinkan nama penulis proposal diisi massal
        'author_id',   // Mengizinkan ID penulis yang terhubung ke tabel users
    ];

    /**
     * Relasi ke akun pengguna yang mengajukan proposal.
     */
    public function authorUser()
    // Mendefinisikan method relasi untuk mengambil akun pengguna
    {
        return $this->belongsTo(User::class, 'author_id');
        // Menyatakan bahwa setiap Sempro dimiliki oleh satu user berdasarkan kolom author_id
    }
}
// Menutup definisi kelas Sempro
