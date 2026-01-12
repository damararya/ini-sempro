<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'label',
        'detail',
        'amount',
        'spent_at',
        'proof_ref',
    ];

    protected $casts = [
        'amount' => 'integer',
        'spent_at' => 'date',
    ];
}
