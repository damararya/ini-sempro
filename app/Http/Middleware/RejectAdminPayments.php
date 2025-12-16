<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RejectAdminPayments
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->can('access-admin')) {
            abort(403, 'Fitur pembayaran hanya tersedia untuk warga.');
        }

        return $next($request);
    }
}
