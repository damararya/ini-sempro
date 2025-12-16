<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$user->can('access-admin')) {
            return redirect()
                ->back(fallback: route('dashboard'))
                ->with('message', 'Anda tidak memiliki akses admin.');
        }

        return $next($request);
    }
}
