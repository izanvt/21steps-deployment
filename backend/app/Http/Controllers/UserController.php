<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /api/admin/users?search=xxx
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $users = User::when($search, function ($q) use ($search) {
                $q->where('name',  'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            })
            ->with('role')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    // PATCH /api/admin/users/{user}/block (y unblock)
    public function block(User $user)
    {
        if ($user->role_id === 2) {
            return response()->json(['message' => 'No puedes bloquear a otro administrador.'], 403);
        }

        $user->update(['blocked' => !$user->blocked]);

        return response()->json([
            'message' => $user->blocked ? 'Usuario bloqueado.' : 'Usuario desbloqueado.',
            'blocked' => $user->blocked,
        ]);
    }

    // DELETE /api/admin/users/{user}
    public function destroy(User $user)
    {
        if ($user->role_id === 2) {
            return response()->json(['message' => 'No puedes eliminar a otro administrador.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }
}