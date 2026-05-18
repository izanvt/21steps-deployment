<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            // rutinas
            [
                'key'         => 'first_routine_created',
                'name'        => 'Primer paso',
                'description' => 'Creaste tu primera rutina. Empieza ya a progresar.',
                'icon'        => '🌱',
            ],
            [
                'key'         => 'first_routine_completed',
                'name'        => '21 días',
                'description' => 'Completaste tu primera rutina entera. ¿A que no fue tan díficil?',
                'icon'        => '🏆',
            ],
            [
                'key'         => 'three_routines_completed',
                'name'        => 'Triatleta de hábitos',
                'description' => 'Has completado tres rutinas distintas. Ya tienes experiencia con esto.',
                'icon'        => '🎯',
            ],
            [
                'key'         => 'three_routines_simultaneous',
                'name'        => 'Multitarea',
                'description' => 'Tienes tres rutinas activas al mismo tiempo. Sigue así.',
                'icon'        => '⚡',
            ],

            // rachas
            [
                'key'         => 'streak_3',
                'name'        => 'En racha',
                'description' => '3 días seguidos cumpliendo. ¡Buen comienzo!',
                'icon'        => '🔥',
            ],
            [
                'key'         => 'streak_5',
                'name'        => 'Semana casi perfecta',
                'description' => '5 días de racha. LLevas un buen ritmo.',
                'icon'        => '🔥',
            ],
            [
                'key'         => 'streak_10',
                'name'        => 'Imparable',
                'description' => '10 días seguidos. No te pares ahora.',
                'icon'        => '💥',
            ],
            [
                'key'         => 'streak_20',
                'name'        => 'Leyenda',
                'description' => '20 días de racha. El rey de las rutinas.',
                'icon'        => '👑',
            ],

            // días registrado
            [
                'key'         => 'days_30_registered',
                'name'        => 'Veterano',
                'description' => 'Llevas 30 días registrado en 21Steps. Esto va en serio.',
                'icon'        => '📅',
            ],

            // social
            [
                'key'         => 'first_friend',
                'name'        => 'Mejor con compañía',
                'description' => 'Añadiste tu primer amigo. Progresad en compañía.',
                'icon'        => '🤝',
            ],
            [
                'key'         => 'five_friends',
                'name'        => 'Influencer',
                'description' => 'Tienes 5 amigos en 21Steps. Seguro que os ayudáis juntos.',
                'icon'        => '👥',
            ],
        ];

        foreach ($badges as $badge) {
            DB::table('badges')->updateOrInsert(
                ['key' => $badge['key']],
                array_merge($badge, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}