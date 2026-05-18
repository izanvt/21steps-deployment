<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoutineSeeder extends Seeder
{
    public function run(): void
    {
        $ejercicio = DB::table('routines')->updateOrInsert(
            // 1. EJERCICIO FÍSICO
            ['name' => 'Ejercicio físico'],
            [
                'name'        => 'Ejercicio físico',
                'description' => 'Construye una rutina de entrenamiento semanal en 21 días. Alterna cardio, tren superior e inferior según tus días disponibles.',
                'icon'        => '💪',
                'quotes'      => json_encode([
                    "150 minutos de ejercicio semanal reducen el riesgo de mortalidad prematura. - OMS",
                    "El ejercicio regular mejora la capacidad cardiorrespiratoria en pocas semanas. - Instituto Americano de Medicina Deportiva",
                    "La actividad física reduce significativamente los síntomas de ansiedad y depresión. - Facultad de Medicina de Harvard",
                    "El entrenamiento de fuerza 2 veces por semana reduce en un 33% el riesgo de muerte por cualquier causa. - Mayo Clinic",
                    "Hacer ejercicio de intensidad moderada puede fortalecer el sistema inmunológico reduciendo infecciones respiratorias hasta un 40%. - Journal of Sport and Health Science",
                    "30 minutos de actividad física al día mejoran la calidad del sueño profundo en un 65%. - National Sleep Foundation",
                ]),
                'metric_type' => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
        $ejercicioId = DB::table('routines')->where('name', 'Ejercicio físico')->value('id');

        $actividadesEjercicio = [
            [
                'name'        => 'Día de cardio',
                'description' => 'Correr, bicicleta, HIIT o cualquier entrenamiento aeróbico de alta intensidad.',
                'duration'    => 30,
            ],
            [
                'name'        => 'Día de tren superior',
                'description' => 'Entrenamiento de fuerza basado en mancuernas. Trabaja pecho, espalda, tríceps, biceps y hombros.',
                'duration'    => 60,
            ],
            [
                'name'        => 'Día de tren inferior',
                'description' => 'Entrenamiento de fuerza basado en mancuernas. Trabaja cuadríceps, glúteos, femoral, isquiotibiales y el resto del tren inferior. ',
                'duration'    => 60,
            ],
        ];

        foreach ($actividadesEjercicio as $act) {
            DB::table('activities')->updateOrInsert(
                ['name' => $act['name'], 'routine_id' => $ejercicioId],
                array_merge($act, [
                    'routine_id' => $ejercicioId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $resourcesEjercicioMap = [
            'Día de cardio'        => [
                [
                    'name' => 'Rutina de HIIT (30 min)',
                    'path' => 'https://www.youtube.com/watch?v=ef2EqYFrIdo',
                ],
            ],
            'Día de tren superior' => [
                [
                    'name' => 'Rutina de tren superior (solo mancuernas)',
                    'path' => 'https://www.youtube.com/watch?v=0yjv6PJjU7E',
                ],
            ],
            'Día de tren inferior' => [
                [
                    'name' => 'Rutina de tren inferior (solo mancuernas)',
                    'path' => 'https://www.youtube.com/watch?v=cXKJQ4qLc4E',
                ],
            ],
        ];

        foreach ($resourcesEjercicioMap as $activityName => $resources) {

            $activityId = DB::table('activities')
                ->where('name', $activityName)
                ->where('routine_id', $ejercicioId)
                ->value('id');

            foreach ($resources as $res) {
                DB::table('resources')->updateOrInsert(
                    [
                        'name'       => $res['name'],
                        'routine_id' => $ejercicioId,
                    ],
                    [
                        'name'        => $res['name'],
                        'path'        => $res['path'],
                        'routine_id'  => $ejercicioId,
                        'activity_id' => $activityId,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]
                );
            }
        }

        // 2. LECTURA DIARIA
        DB::table('routines')->updateOrInsert(
            ['name' => 'Lectura diaria'],
            [
                'name'        => 'Lectura diaria',
                'description' => 'Crea el hábito de leer cada día, durante los minutos que tu escojas. Una vez a la semana, escribe sonre lo leído.',
                'icon'        => '📚',
                'quotes'      => json_encode([
                    "Leer regularmente mejora la conectividad cerebral y la comprensión. - Universidad de Emory",
                    "La lectura puede reducir el estrés hasta en un 60% en pocos minutos. - Universidad de Sussex",
                    "Leer más de 1 vez por semana reduce el riesgo de deterioro cognitivo hasta un ~46%. - Estudio PMC",
                    "Las personas que leen al menos 30 minutos al día viven, en promedio, casi dos años más que las que no leen. - Universidad de Yale",
                    "La lectura constante aumenta la reserva cognitiva, protegiendo contra el desarrollo temprano de Alzheimer. - Academia Americana de Neurología",
                    "Leer ficción de manera habitual incrementa la empatía y la inteligencia emocional en un 20%. - Science Magazine",
                ]),
                'metric_type' => 'minutes',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
        $lecturaId = DB::table('routines')->where('name', 'Lectura diaria')->value('id');

        $actividadesLectura = [
            [
                'name'        => 'Sesión de lectura',
                'description' => 'Lee durante el tiempo que hayas marcado como objetivo.',
                'duration'    => null, // cada usuario escoge con target_value
            ],
            [
                'name'        => 'Resumen semanal',
                'description' => 'Reflexiona sobre lo que has leído esta semana. Escribe las ideas o frases más interesantes, o simplemente resúmelo.',
                'duration'    => 15,
            ],
        ];

        foreach ($actividadesLectura as $act) {
            DB::table('activities')->updateOrInsert(
                ['name' => $act['name'], 'routine_id' => $lecturaId],
                array_merge($act, [
                    'routine_id' => $lecturaId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 3. DEJAR EL TABACO
        DB::table('routines')->updateOrInsert(
            ['name' => 'Dejar de fumar'],
            [
                'name'        => 'Dejar de fumar',
                'description' => 'Reduce progresivamente el número de cigarrillos en 21 días.',
                'icon'        => '🚬',
                'quotes'      => json_encode([
                    "Dejar de fumar aumenta la esperanza de vida hasta 10 años si se abandona a tiempo. - Diario de Medicina de Nueva Inglaterra",
                    "A las 24 horas de dejar de fumar, el riesgo de infarto empieza a disminuir. - OMS",
                    "En 2–6 semanas tras dejar de fumar, mejora la circulación y la función pulmonar aumenta. - Centro para la prevención de enfermedades",
                    "Un año después de dejar de fumar, el riesgo de enfermedad coronaria se reduce a la mitad respecto al de un fumador. - Asociación Americana del Corazón",
                    "Dejar el tabaco antes de los 40 años reduce en un 90% el riesgo de muerte por enfermedades relacionadas con el tabaquismo. - The Lancet",
                    "A las 72 horas de dejar de fumar, los tubos bronquiales se relajan, facilitando una mejora del 30% en la capacidad respiratoria. - Servicio Nacional de Salud (Reino Unido)",
                ]),
                'metric_type' => 'cigarettes',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
        $fumarId = DB::table('routines')->where('name', 'Dejar de fumar')->value('id');

        DB::table('activities')->updateOrInsert(
            ['name' => 'Registro diario', 'routine_id' => $fumarId],
            [
                'name'        => 'Registro diario',
                'description' => 'Introduce cuántos cigarrillos has fumado hoy.',
                'duration'    => null,
                'routine_id'  => $fumarId,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );

        // 4. RUTINA SOSTENIBLE
        DB::table('routines')->updateOrInsert(
            ['name' => 'Rutina sostenible'],
            [
                'name'        => 'Rutina sostenible',
                'description' => 'Reduce tu huella medioambiental con un pequeño reto diario, distinto cada vez.',
                'icon'        => '🌱',
                'quotes'      => json_encode([
                    "Si 1.000 personas reducen su consumo de carne 3 días/semana, se evitan miles de toneladas de CO₂ al año. - Comida y agricultura de la ONU",
                    "La adopción de hábitos de consumo responsables ayudara a reducir la extracción de recursos naturales - Programa Ambiental Global",
                    "Con pequeñas acciones en grupos grandes, el ahorro total equivale al consumo anual de millones de hogares. - Agencia Internacional de Energia",
                    "Usar una botella reutilizable evita la producción de aproximadamente 167 botellas de plástico desechables al año por persona. - Earth Day Network",
                    "Reducir el tiempo en la ducha a 5 minutos ahorra hasta 3.000 litros de agua por persona al mes. - Agencia de Protección Ambiental de EEUU",
                    "Desconectar los aparatos electrónicos que no usas puede reducir tu factura de la luz hasta en un 10%. - Departamento de Energía de EEUU",
                ]),
                'metric_type' => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
        $sostenibleId = DB::table('routines')->where('name', 'Rutina sostenible')->value('id');

        $retosSostenibles = [
            ['name' => 'Duchate en menos tiempo', 'description' => 'Limita tu ducha a 5-10 minutos. Ahorrarás hasta 50 litros de agua.'],
            ['name' => 'Un día sin plastico', 'description' => 'Evita bolsas, pajitas y envases de plástico desechable durante todo el día.'],
            ['name' => 'Sin coche', 'description' => 'Ve a pie, en bici o en transporte público. Deja el coche en casa.'],
            ['name' => 'Apaga lo que no uses', 'description' => 'Desenchufa dispositivos sin usar y apaga las luces al salir de cada habitación.'],
            ['name' => 'Compra local', 'description' => 'Si necesitas comprar algo hoy, elige un comercio local o de proximidad.'],
            ['name' => 'Día sin carne', 'description' => 'Sustituye la carne por proteína vegetal. Reduce tu huella de carbono.'],
            ['name' => 'Recicla correctamente', 'description' => 'Revisa que estás separando bien vidrio, papel, plástico y orgánico.'],
            ['name' => 'Una segunda vida para tu ropa', 'description' => 'Vende la ropa que no uses, contribuye a reducir el fast-fashion.'],
            ['name' => 'Aprovecha lo que cocinas', 'description' => 'Planifica tus comidas y aprovecha las sobras. No tires comida hoy.'],
            ['name' => 'Bolsa reutilizable', 'description' => 'Lleva tu propia bolsa a la compra. Rechaza cualquier bolsa de plástico.'],
            ['name' => 'Cuidado con el cepillado', 'description' => 'Al cepillarte los dientes, no dejes el grifo abierto.'],
            ['name' => 'Paseo en la naturaleza', 'description' => 'Pasea por un parque, monte o lugar con naturaleza.'],
            ['name' => 'Reduce la calefacción/aire', 'description' => 'Regula tu termostato para ahorrar más energia.'],
            ['name' => 'Aprende sobre sostenibilidad', 'description' => 'Lee un artículo sobre cambio climático o medio ambiente.'],
            ['name' => 'Dona o intercambia', 'description' => 'Identifica un objeto que ya no uses y dónalo o intercámbialo en lugar de tirarlo.'],
            ['name' => 'Recoge tus desechos', 'description' => 'Asegurate de recoger cualquier desecho o basura que crees durante el día.'],
            ['name' => 'Limpieza ecológica', 'description' => 'Usa bicarbonato, vinagre o productos ecológicos para limpiar en lugar de químicos agresivos.'],
            ['name' => 'Ahorra papel', 'description' => 'Imprime solo lo imprescindible. Usa el dorso de hojas ya usadas.'],
            ['name' => 'Comunidad sostenible', 'description' => 'Comparte con alguien de tu entorno un hábito sostenible que hayas aprendido este mes.'],
            ['name' => 'Revisa tu consumo', 'description' => 'Consulta el consumo eléctrico de tu hogar y piensa en qué puedes reducir.'],
            ['name' => 'Compromiso final', 'description' => 'Elige el hábito de estas 3 semanas que más te ha costado y comprométete a mantenerlo.'],
        ];

        foreach ($retosSostenibles as $reto) {
            DB::table('activities')->updateOrInsert(
                ['name' => $reto['name'], 'routine_id' => $sostenibleId],
                array_merge($reto, [
                    'duration'   => null,
                    'routine_id' => $sostenibleId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 5. RESPIRACIÓN Y CALMA
        DB::table('routines')->updateOrInsert(
            ['name' => 'Respiración y calma'],
            [
                'name'        => 'Respiración y calma',
                'description' => 'Incorpora una práctica diaria de respiración consciente. Tres técnicas que rotan durante la semana.',
                'icon'        => '🧘',
                'quotes'      => json_encode([
                    "La respiración lenta y controlada puede activar el sistema nervioso parasimpático, reduciendo la frecuencia cardíaca. - Escuela medica de Harvard",
                    "La respiración profunda puede reducir de forma aguda los niveles de estrés percibido. - Instituto Nacional de Salud (EEUU)",
                    "Técnicas de respiración lenta pueden reducir la frecuencia cardíaca en torno a un 10% en personas sanas. - Escuela medica de Harvard",
                    "Cinco minutos diarios de respiración profunda logran reducir los niveles de cortisol, la hormona del estrés, en un 20%. - Universidad de Stanford",
                    "Las prácticas regulares de respiración controlada mejoran la atención sostenida y reducen los errores cognitivos en un 35%. - Trinity College Dublin",
                    "La respiración diafragmática durante 15 minutos mejora significativamente la presión arterial en pacientes hipertensos. - Journal of Clinical Medicine",
                ]),
                'metric_type' => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]
        );
        $respiracionId = DB::table('routines')->where('name', 'Respiración y calma')->value('id');

        $actividadesRespiracion = [
            [
                'name'        => 'Respiración 4-7-8',
                'description' => 'Inhala 4 segundos, retén 7, exhala 8. Consigue reducir la ansiedad y conciliar el sueño.',
                'duration'    => 5,
                'resource'    => [
                    'name' => 'Guía: Respiración 4-7-8',
                    'path' => 'https://www.youtube.com/watch?v=S6CmxoIkHd48',
                ],
            ],
            [
                'name'        => 'Box Breathing',
                'description' => 'Inhala 4s, retén 4s, exhala 4s, retén 4s. Se utiliza para cntrolar el estrés en situaciones límite.',
                'duration'    => 5,
                'resource'    => [
                    'name' => 'Guía: Box Breathing',
                    'path' => 'https://www.youtube.com/watch?v=Zday_QtC0_0',
                ],
            ],
            [
                'name'        => 'Respiración diafragmática',
                'description' => 'Respira desde el abdomen, no desde el pecho. Pon una mano en el vientre y asegúrate de que sube y baja.',
                'duration'    => 5,
                'resource'    => [
                    'name' => 'Guía: Respiración diafragmática',
                    'path' => 'https://www.youtube.com/watch?v=eP3VHiqmelc',
                ],
            ],
        ];

        foreach ($actividadesRespiracion as $act) {
            $resource = $act['resource'];
            unset($act['resource']);

            DB::table('activities')->updateOrInsert(
                ['name' => $act['name'], 'routine_id' => $respiracionId],
                array_merge($act, [
                    'routine_id' => $respiracionId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );

            $activityId = DB::table('activities')
                ->where('name', $act['name'])
                ->where('routine_id', $respiracionId)
                ->value('id');

            DB::table('resources')->updateOrInsert(
                ['name' => $resource['name'], 'routine_id' => $respiracionId],
                array_merge($resource, [
                    'routine_id'  => $respiracionId,
                    'activity_id' => $activityId,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ])
            );
        }
    }
}
