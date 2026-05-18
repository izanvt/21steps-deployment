<?php
namespace App\Http\Controllers;

use App\Models\FriendRequest;
use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Http\Request;

class FriendRequestController extends Controller
{
    protected BadgeService $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    // GET /api/friends
    public function index(Request $request)
    {
        $user = $request->user();

        $friends = FriendRequest::where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->where('status', 1)
            ->with([
                'sender.userRoutines' => function ($q) {
                    $q->with('routine')->withCount(['events', 'events as completed_events_count' => function ($query) {
                        $query->where('completed', true);
                    }]);
                },
                'receiver.userRoutines' => function ($q) {
                    $q->with('routine')->withCount(['events', 'events as completed_events_count' => function ($query) {
                        $query->where('completed', true);
                    }]);
                },
                'sender.badges', 
                'receiver.badges'
            ])
            ->get()
            ->map(function ($fr) use ($user) {
                $friend = $fr->sender_id === $user->id ? $fr->receiver : $fr->sender;
                return [
                    'friendship_id' => $fr->id,
                    'id'            => $friend->id,
                    'name'          => $friend->name,
                    'bio'           => $friend->bio,
                    'badges'        => $friend->badges,
                    'share_token'   => $friend->share_token,
                    'routines'      => $friend->userRoutines->map(fn($ur) => [
                        'id'      => $ur->id,
                        'name'    => $ur->routine?->name,
                        'icon'    => $ur->routine?->icon,
                        'colour'  => $ur->colour,
                        'progress'=> $ur->events_count > 0
                            ? round(($ur->completed_events_count / $ur->events_count) * 100)
                            : 0,
                    ]),
                ];
            });

        return response()->json($friends);
    }

    // GET /api/friend-requests
    // conseguir solicitudes pendientes 
    public function pending(Request $request)
    {
        $requests = FriendRequest::where('receiver_id', $request->user()->id)
            ->where('status', 0)
            ->with('sender:id,name,bio,share_token')
            ->get();

        return response()->json($requests);
    }

    // POST /api/friend-requests
    // enviar solicitud
    public function send(Request $request)
    {
        $request->validate(['receiver_id' => 'required|exists:users,id']);

        $user = $request->user();

        if ($request->receiver_id === $user->id) {
            return response()->json(['message' => 'No puedes enviarte una solicitud a ti mismo.'], 422);
        }

        // verificar que no existe ya
        $exists = FriendRequest::where(function ($q) use ($user, $request) {
            $q->where('sender_id', $user->id)->where('receiver_id', $request->receiver_id);
        })->orWhere(function ($q) use ($user, $request) {
            $q->where('sender_id', $request->receiver_id)->where('receiver_id', $user->id);
        })->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya existe una solicitud entre estos usuarios.'], 422);
        }

        $fr = FriendRequest::create([
            'sender_id'   => $user->id,
            'receiver_id' => $request->receiver_id,
            'status'      => 0,
        ]);

        return response()->json($fr, 201);
    }

    // PATCH /api/friend-requests/{id}/accept
    public function accept(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->receiver_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $friendRequest->update(['status' => 1]);

        $this->badgeService->checkAndAward($request->user());
        $this->badgeService->checkAndAward($friendRequest->sender);

        return response()->json(['message' => 'Solicitud aceptada.']);
    }

    // PATCH /api/friend-requests/{id}/reject
    public function reject(Request $request, FriendRequest $friendRequest)
    {
        if ($friendRequest->receiver_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $friendRequest->update(['status' => 2]);

        return response()->json(['message' => 'Solicitud rechazada.']);
    }

    // DELETE /api/friends/{id} — eliminar amistad
    public function destroy(Request $request, FriendRequest $friendRequest)
    {
        $user = $request->user();

        if ($friendRequest->sender_id !== $user->id && $friendRequest->receiver_id !== $user->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $friendRequest->delete();

        return response()->json(['message' => 'Amistad eliminada.']);
    }
}