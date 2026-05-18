<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()?->role_id !== 2) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }
        return $next($request);
    }
}