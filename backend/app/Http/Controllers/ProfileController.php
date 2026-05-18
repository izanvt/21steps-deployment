<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\User;

class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        $user = $request->user()->load('badges');
        return response()->json($user);
    }

    // PATCH /api/profile
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'bio' => 'sometimes|nullable|string|max:500',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if ($request->has('name'))
            $user->name = $request->name;
        if ($request->has('email'))
            $user->email = $request->email;
        if ($request->has('bio'))
            $user->bio = $request->bio;
        if ($request->has('password'))
            $user->password = Hash::make($request->password);

        $user->save();

        return response()->json($user);
    }

    public function publicProfile(string $shareToken)
    {
        $user = User::where('share_token', $shareToken)
            ->with('badges')
            ->firstOrFail();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'bio' => $user->bio,
            'badges' => $user->badges,
            'share_token' => $user->share_token,
        ]);
    }


}