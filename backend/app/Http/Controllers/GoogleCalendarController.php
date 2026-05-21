<?php
namespace App\Http\Controllers;

use App\Models\UserRoutine;
use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventDateTime;
use Illuminate\Http\Request;

class GoogleCalendarController extends Controller
{
    private function getClient(): Client
    {
        // los valores van del .env a services.php y se importan aquí
        $client = new Client();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));
        $client->addScope(Calendar::CALENDAR_EVENTS);
        $client->setAccessType('offline');
        $client->setPrompt('consent');
        return $client;
    }

    // GET /api/google/auth
    public function redirectToGoogle(Request $request)
    {
        $client = $this->getClient();

        // guardamos el user id en el state
        $client->setState($request->user()->id);
        $url = $client->createAuthUrl();
        return response()->json(['url' => $url]);
    }

    // GET /api/google/callback
    public function handleCallback(Request $request)
    {
        $client = $this->getClient();

        try {
            $token = $client->fetchAccessTokenWithAuthCode($request->code);
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/?google=error');
        }

        if (isset($token['error'])) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/?google=error');
        }

        $userId = $request->state;
        $user   = \App\Models\User::find($userId);

        if (!$user) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/?google=error');
        }

        $user->update(['google_token' => json_encode($token)]);

        return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/?google=success');
    }

    // POST /api/google/sync/{userRoutine}
    // se sincronizan los eventos de la rutina con Google Calendar
    public function syncRoutine(Request $request, UserRoutine $userRoutine)
    {
        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $user = $request->user();

        if (!$user->google_token) {
            return response()->json(['message' => 'No se ha podido conectar con Google Calendar.'], 422);
        }

        $client    = $this->getClient();
        $tokenData = json_decode($user->google_token, true);
        $client->setAccessToken($tokenData);

        // renovar token si es necesario
        if ($client->isAccessTokenExpired()) {
            $newToken = $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
            $user->update(['google_token' => json_encode($newToken)]);
            $client->setAccessToken($newToken);
        }

        $service = new Calendar($client);
        $userRoutine->load(['events.userRoutineActivity.activity', 'routine']);

        $created = 0;

        foreach ($userRoutine->events as $event) {
            try {
                $dateStr    = \Carbon\Carbon::parse($event->date)->format('Y-m-d');
                $dateEndStr = \Carbon\Carbon::parse($event->date)->addDay()->format('Y-m-d');

                $activityName = $event->userRoutineActivity?->activity?->name        ?? 'Actividad';
                $activityDesc = $event->userRoutineActivity?->activity?->description ?? '';
                $duration     = $event->userRoutineActivity?->activity?->duration;
                $routineName  = $userRoutine->routine?->name ?? '21Steps';

                $gEvent = new Event();
                $gEvent->setSummary("{$routineName} — {$activityName}");

                $description = $activityDesc;
                if ($duration) $description .= "\n\nDuración: {$duration} min";
                $description .= "\n\n— 21Steps";
                $gEvent->setDescription(trim($description));

                $start = new EventDateTime();
                $start->setDate($dateStr);
                $end = new EventDateTime();
                $end->setDate($dateEndStr);
                $gEvent->setStart($start);
                $gEvent->setEnd($end);

                $service->events->insert('primary', $gEvent);
                $created++;

            } catch (\Exception $e) {
                \Log::error('Error evento Google: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => "{$created} eventos añadidos a tu Calendar.",
        ]);
    }

    // GET /api/google/status
    public function status(Request $request)
    {
        return response()->json([
            'connected' => !is_null($request->user()->google_token),
        ]);
    }

    // DELETE /api/google/disconnect
    public function disconnect(Request $request)
    {
        $request->user()->update(['google_token' => null]);
        return response()->json(['message' => 'Google Calendar desconectado.']);
    }
}