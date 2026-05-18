import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { selectUserRoutines, selectUserRoutinesStatus } from "../routines/routinesSlice";
import { fetchUserRoutines, completeEvent, uncompleteEvent } from "../routines/thunks";
import { MONTHS, WEEKDAYS } from "../utils/dates";

// codigo ampliamente reutilizado de Event.jsx
export default function DayView() {
    const { date } = useParams(); // YYYY-MM-DD
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userRoutines = useSelector(selectUserRoutines);
    const status = useSelector(selectUserRoutinesStatus);

    useEffect(() => {
        if (status === "idle") dispatch(fetchUserRoutines());
    }, [dispatch, status]);

    // divide la fecha en datos separados
    const parsedDate = useMemo(() => {
        if (!date) return null;
        const [year, month, day] = date.split("-").map(Number);
        return { year, month, day, obj: new Date(year, month - 1, day) };
    }, [date]);

    // completar o descompletar un evento
    const handleToggleEvent = (event) => {
        const isFuture = new Date(event.date).setHours(0, 0, 0, 0) >
            new Date().setHours(0, 0, 0, 0);

        if (isFuture) return;

        dispatch(
            event.completed
                ? uncompleteEvent(event.id)
                : completeEvent({ id: event.id, metric_value: null })
        );
    };

    // filtra por los eventos del día
    const dayEvents = useMemo(() => {
        if (!date) return [];

        const result = [];

        userRoutines.forEach(ur => {
            ur.events?.forEach(e => {
                const eDate = e.date?.split("T")[0];
                if (eDate === date) {
                    result.push({
                        ...e,
                        routineName: ur.routine?.name ?? "",
                        routineIcon: ur.routine?.icon ?? "📋",
                        routineColour: ur.colour,
                        activityName: e.user_routine_activity?.activity?.name ?? "Actividad",
                        activityDesc: e.user_routine_activity?.activity?.description ?? "",
                        duration: e.user_routine_activity?.activity?.duration ?? null,
                        userRoutineId: ur.id,
                    });
                }
            });
        });

        return result;
    }, [userRoutines, date]);

    const completed = dayEvents.filter(e => e.completed).length;
    const total = dayEvents.length;
    const allDone = total > 0 && completed === total;

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        );
    }

    if (!parsedDate) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-400 text-sm">Fecha no válida.</p>
            </div>
        );
    }

    const { obj, day, month, year } = parsedDate;
    const weekDay = WEEKDAYS[obj.getDay()];
    const monthName = MONTHS[month - 1];

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

                {/* breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>›</span>
                    <span className="text-gray-600 font-medium capitalize">
                        {weekDay}, {day} de {monthName} de {year}
                    </span>
                </div>

                {/* header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-gray-900 capitalize">
                        {weekDay}, {day} de {monthName}
                    </h1>

                    {total > 0 ? (
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all bg-green"
                                    style={{
                                        width: `${Math.round((completed / total) * 100)}%`,
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-500">
                                {completed}/{total} completadas
                            </span>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm mt-2">
                            Sin eventos programados para hoy.
                        </p>
                    )}
                </div>

                {/* lista eventos */}
                <div className="space-y-3">
                    {dayEvents.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            No hay actividades para hoy.
                        </div>
                    ) : (
                        dayEvents.map(event => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const d = new Date(event.date);
                            d.setHours(0, 0, 0, 0);

                            const isFuture = d > today;

                            return (
                                <Link
                                    key={event.id}
                                    to={`/events/${event.id}`}
                                    className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start gap-4">

                                        {/* botón completar */}
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleToggleEvent(event);
                                            }}
                                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                                            style={{
                                                borderColor: event.completed
                                                    ? event.routineColour
                                                    : "lightgrey",
                                                background: event.completed
                                                    ? event.routineColour
                                                    : "transparent",
                                                opacity: isFuture ? 0.4 : 1,
                                                cursor: isFuture ? "not-allowed" : "pointer"
                                            }}
                                            title={
                                                isFuture
                                                    ? "No puedes completar eventos futuros"
                                                    : event.completed
                                                        ? "Desmarcar"
                                                        : "Marcar como completado"
                                            }
                                        >
                                            {/* dibujamos el círculo de los eventos completados */}
                                            {event.completed && (
                                                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                                                    <path
                                                        d="M2 6l3 3 5-5"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        {/* contenido */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span>{event.routineIcon}</span>
                                                <span
                                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: event.routineColour + "20",
                                                        color: event.routineColour
                                                    }}
                                                >
                                                    {event.routineName}
                                                </span>
                                            </div>

                                            <p className="font-bold text-sm text-gray-800">
                                                {event.activityName}
                                            </p>

                                            {event.activityDesc && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {event.activityDesc}
                                                </p>
                                            )}
                                        </div>

                                        <span className="text-gray-300">›</span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-8 text-sm font-semibold text-blue"
                >
                    ← Volver
                </button>
            </main>
        </div>
    );
}