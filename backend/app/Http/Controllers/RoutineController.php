<?php
namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Routine;
use App\Models\UserRoutine;
use App\Models\UserRoutineActivity;
use App\Services\BadgeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoutineController extends Controller
{
    protected BadgeService $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    // GET /api/baseroutines
    public function index()
    {
        $routines = Routine::with(['activities', 'resources'])->get();
        return response()->json($routines);
    }

    // GET /api/routines
    public function userRoutines(Request $request)
    {
        $routines = UserRoutine::with([
            'routine',
            'userRoutineActivities.activity',
            'events.userRoutineActivity.activity',
            'events.userRoutineActivity.activity.resource',
        ])
            ->where('user_id', $request->user()->id)
            ->get()
            ->map(function ($ur) {
                $totalEvents     = $ur->events->count();
                $completedEvents = $ur->events->where('completed', true)->count();
                $ur->progress    = $totalEvents > 0
                    ? round(($completedEvents / $totalEvents) * 100)
                    : 0;
                return $ur;
            });

        return response()->json($routines);
    }

    // GET api/routines/{id}
    public function userRoutineById(Request $request, UserRoutine $userRoutine)
    {
        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $userRoutine->load([
            'routine',
            'userRoutineActivities.activity',
            'events',
            'events.userRoutineActivity.activity',
        ]);

        $totalEvents     = $userRoutine->events->count();
        $completedEvents = $userRoutine->events->where('completed', true)->count();

        $userRoutine->progress = $totalEvents > 0
            ? round(($completedEvents / $totalEvents) * 100)
            : 0;

        return response()->json($userRoutine);
    }

    // POST /api/routines
    public function store(Request $request)
    {
        $request->validate([
            'routine_id'                  => 'required|exists:routines,id',
            'colour'                      => 'required|string',
            'target_value'                => 'nullable|integer',
            'activities'                  => 'nullable|array|min:0',
            'activities.*.activity_id'    => 'required|exists:activities,id',
            'activities.*.days_of_week'   => 'required|array|min:1',
            'activities.*.days_of_week.*' => 'integer|min:0|max:6',
        ]);

        // controlar que no se puede volver a crear el mismo tipo de rutina
        $alreadyExists = UserRoutine::where('user_id', $request->user()->id)
            ->where('routine_id', $request->routine_id)
            ->exists();

        if ($alreadyExists) {
            return response()->json([
                'message' => 'Solo puedes crear una rutina de cada tipo.',
            ], 422);
        }

        DB::transaction(function () use ($request) {
            $user      = $request->user();
            $startDate = Carbon::today();
            $endDate   = $this->calculate21DaysEnd($startDate);

            $userRoutine = UserRoutine::create([
                'user_id'      => $user->id,
                'routine_id'   => $request->routine_id,
                'colour'       => $request->colour,
                'start_date'   => $startDate,
                'end_date'     => $endDate,
                'target_value' => $request->target_value,
            ]);

            $routine       = \App\Models\Routine::find($request->routine_id);
            $isDailyUnique = $routine->activities()->count() === 21;

            if ($isDailyUnique) {
                // rutina sostenible: cada actividad en un dia consecutivo
                $activities = $routine->activities()->get();
                foreach ($activities as $index => $activity) {
                    $date = $startDate->copy()->addDays($index);

                    $ura = UserRoutineActivity::create([
                        'user_routine_id' => $userRoutine->id,
                        'activity_id'     => $activity->id,
                        'day_of_week'     => $date->dayOfWeek === 0 ? 6 : $date->dayOfWeek - 1,
                    ]);

                    Event::create([
                        'user_routine_id'          => $userRoutine->id,
                        'user_routine_activity_id' => $ura->id,
                        'date'                     => $date->toDateString(),
                        'completed'                => false,
                        'cancelled'                => false,
                    ]);
                }
            } else {
                // lógica normal para el resto de rutinas
                foreach ($request->activities as $actData) {
                    foreach ($actData['days_of_week'] as $dow) {
                        $ura = UserRoutineActivity::create([
                            'user_routine_id' => $userRoutine->id,
                            'activity_id'     => $actData['activity_id'],
                            'day_of_week'     => $dow,
                        ]);
                        $this->generateEvents($userRoutine, $ura, $startDate, $endDate, $dow);
                    }
                }
            }
        });

        // verificar badges tras crear rutina
        $this->badgeService->checkAndAward($request->user());

        return response()->json(['message' => 'Rutina creada correctamente.'], 201);
    }

    // PATCH /api/routines/{id}
    public function update(Request $request, UserRoutine $userRoutine)
    {
        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $request->validate([
            'colour'       => 'sometimes|string',
            'target_value' => 'sometimes|nullable|integer',
        ]);

        $userRoutine->update($request->only('colour', 'target_value'));

        return response()->json($userRoutine);
    }

    // POST /api/routines/{id}/pause
    public function pause(Request $request, UserRoutine $userRoutine)
    {
        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $request->validate(['type' => 'required|in:day,week']);

        $days = $request->type === 'week' ? 7 : 1;

        DB::transaction(function () use ($userRoutine, $days) {
            $userRoutine->update([
                'paused'       => true,
                'paused_until' => Carbon::today()->addDays($days),
                'end_date'     => Carbon::parse($userRoutine->end_date)->addDays($days),
            ]);

            Event::where('user_routine_id', $userRoutine->id)
                ->where('date', '>=', Carbon::today())
                ->get()
                ->each(fn($event) => $event->update([
                    'date' => Carbon::parse($event->date)->addDays($days),
                ]));
        });

        return response()->json(['message' => 'Rutina pausada correctamente.']);
    }

    // POST /api/routines/{id}/unpause
    public function unpause(Request $request, UserRoutine $userRoutine)
    {
        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if (!$userRoutine->paused) {
            return response()->json(['message' => 'La rutina no está pausada.'], 400);
        }

        $pausedUntil = Carbon::parse($userRoutine->paused_until)->startOfDay();
        $today = Carbon::today();
        
        $remainingDays = $today->diffInDays($pausedUntil, false);

        DB::transaction(function () use ($userRoutine, $remainingDays, $pausedUntil) {
            if ($remainingDays > 0) {
                // Desplazamos hacia atrás los eventos restantes para que la rutina continúe HOY
                Event::where('user_routine_id', $userRoutine->id)
                    ->where('date', '>=', $pausedUntil)
                    ->get()
                    ->each(fn($event) => $event->update([
                        'date' => Carbon::parse($event->date)->subDays($remainingDays),
                    ]));

                $userRoutine->end_date = Carbon::parse($userRoutine->end_date)->subDays($remainingDays);
            }

            $userRoutine->paused = false;
            $userRoutine->paused_until = null;
            $userRoutine->save();
        });

        return response()->json(['message' => 'Rutina despausada correctamente.']);
    }

    // DELETE /api/routines/{id}
    public function destroy(Request $request, UserRoutine $userRoutine)
    {
        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $userRoutine->delete();

        return response()->json(['message' => 'Rutina eliminada correctamente.']);
    }

    // POST /api/events/{id}/complete
    public function completeEvent(Request $request, Event $event)
    {
        $userRoutine = $event->userRoutine;

        if ($userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $request->validate([
            'metric_value' => 'nullable|numeric',
            'mood'         => 'nullable|integer|between:1,3',
            'notes'        => 'nullable|string'
        ]);

        $event->update([
            'completed'    => true,
            'metric_value' => $request->metric_value !== null ? (int) $request->metric_value : null,
            'mood'         => $request->mood,
            'notes'        => $request->notes,
        ]);

        // verificar badges tras completar evento (racha, rutina completada...)
        $this->badgeService->checkAndAward($request->user());

        $event->load('userRoutineActivity.activity');

        return response()->json($event);
    }

    // POST /api/events/{id}/uncomplete
    public function uncompleteEvent(Request $request, Event $event)
    {
        $userRoutine = $event->userRoutine;

        if (! $userRoutine || $userRoutine->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $event->update([
            'completed'    => false,
            'metric_value' => null,
            'mood'         => null,
            'notes'        => null,
        ]);

        $event->load('userRoutineActivity.activity');

        return response()->json($event);
    }

    // helpers

    private function generateEvents(
        UserRoutine $userRoutine,
        UserRoutineActivity $ura,
        Carbon $startDate,
        Carbon $endDate,
        int $dow
    ): void {
        $date = $startDate->copy();

        while ($date->dayOfWeek !== $this->toCarbon($dow)) {
            $date->addDay();
        }

        while ($date->lte($endDate)) {
            Event::create([
                'user_routine_id'          => $userRoutine->id,
                'user_routine_activity_id' => $ura->id,
                'date'                     => $date->toDateString(),
                'completed'                => false,
                'cancelled'                => false,
            ]);
            $date->addWeek();
        }
    }

    private function toCarbon(int $dow): int
    {
        return $dow === 6 ? 0 : $dow + 1;
    }

    private function calculate21DaysEnd(Carbon $start): Carbon
    {
        return $start->copy()->addDays(20);
    }
}
