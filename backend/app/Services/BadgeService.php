<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\User;
use Carbon\Carbon;

class BadgeService
{
    // lo añadiremos en UserRoutine y FriendRoutine para controlar si se ha completado una nueva badge despues de x acción
    public function checkAndAward(User $user): void
    {
        $this->checkRoutineBadges($user);
        $this->checkStreakBadges($user);
        $this->checkDaysBadges($user);
        $this->checkFriendBadges($user);
    }

    // específica de rutinas
    private function checkRoutineBadges(User $user): void
    {
        $userRoutines = $user->userRoutines()->with('events')->get();
        $active       = $userRoutines->count();
        $completed    = $userRoutines->filter(fn($ur) =>
            $ur->events->count() > 0 &&
            $ur->events->every(fn($e) => $e->completed)
        )->count();

        // primera rutina creada
        if ($active >= 1) {
            $this->award($user, 'first_routine_created');
        }

        // primera rutina completada
        if ($completed >= 1) {
            $this->award($user, 'first_routine_completed');
        }

        // tres rutinas completadas
        if ($completed >= 3) {
            $this->award($user, 'three_routines_completed');
        }

        // tres rutinas simultáneas activas
        if ($active >= 3) {
            $this->award($user, 'three_routines_simultaneous');
        }
    }

    // rachas
    private function checkStreakBadges(User $user): void
    {
        $streak = $this->calculateStreak($user);

        if ($streak >= 3)  $this->award($user, 'streak_3');
        if ($streak >= 5)  $this->award($user, 'streak_5');
        if ($streak >= 10) $this->award($user, 'streak_10');
        if ($streak >= 20) $this->award($user, 'streak_20');
    }

    private function calculateStreak(User $user): int
    {
        $dates = \App\Models\Event::whereHas('userRoutine', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('completed', true)
            ->where('date', '<=', Carbon::today())
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values()
            ->toArray();

        $count = 0;
        $currentDate = Carbon::today();

        foreach ($dates as $date) {
            if ($date === $currentDate->toDateString()) {
                $count++;
                $currentDate->subDay();
            } else {
                break;
            }
        }

        // guardamos el streak en el modelo de usuario
        if ($user->streak !== $count) {
            $user->update(['streak' => $count]);
        }

        return $count;
    }

    // tiempo registrado (fecha creación usuario)
    private function checkDaysBadges(User $user): void
    {
        $daysSince = Carbon::parse($user->created_at)->diffInDays(Carbon::now());

        if ($daysSince >= 30) {
            $this->award($user, 'days_30_registered');
        }
    }

    // amigos
    private function checkFriendBadges(User $user): void
    {
        // amigos = requests aceptadas donde el user es sender o receiver
        $friendCount = \App\Models\FriendRequest::where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->where('status', 1) // 1 = aceptado
            ->count();

        if ($friendCount >= 1) $this->award($user, 'first_friend');
        if ($friendCount >= 5) $this->award($user, 'five_friends');
    }

    // otorgarla si no la tiene
    private function award(User $user, string $key): void
    {
        $badge = Badge::where('key', $key)->first();
        if (!$badge) return;

        // evitar duplicados
        $already = $user->badges()->where('badge_id', $badge->id)->exists();
        if ($already) return;

        // si no sería duplicado se la pone
        $user->badges()->attach($badge->id, [
            'unlocked_at' => now(),
        ]);
    }
}