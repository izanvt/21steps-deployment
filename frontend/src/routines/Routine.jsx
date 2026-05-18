import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchUserRoutines, pauseUserRoutine, unpauseUserRoutine, deleteUserRoutine, completeEvent, uncompleteEvent } from "../routines/thunks";
import { selectUserRoutines, selectUserRoutinesStatus } from "../routines/routinesSlice";
import { MONTHS, DAYS, formatDate } from "../utils/dates";

// cada evento
function EventRow({ event, colour, onComplete }) {
    const dateObj = event.date ? new Date(event.date) : null;

    const dateStr = dateObj
        ? `${dateObj.getDate()} ${MONTHS[dateObj.getMonth()].slice(0, 3)}`
        : "—";

    const weekDay = dateObj ? DAYS[(dateObj.getDay() + 6) % 7] : "";

    // normalizamos fechas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = dateObj ? new Date(dateObj) : null;
    if (eventDate) eventDate.setHours(0, 0, 0, 0);

    const isFuture = eventDate ? eventDate > today : false;
    const isPastOrToday = eventDate ? eventDate <= today : false;

    const handleCircleClick = (e) => {
        e.preventDefault();

        // solo pasados o de hoy, nunca futuros
        if (isFuture) return;
        onComplete(event);
    };

    return (
        <Link
            to={`/events/${event.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm hover:border-gray-300"
        >
            {/* fecha */}
            <div className="text-center w-10 shrink-0">
                <p className="text-xs font-bold text-gray-400">{weekDay}</p>
                <p className="text-sm font-black text-gray-700">{dateStr}</p>
            </div>

            {/* círculo */}
            <button
                onClick={handleCircleClick}
                disabled={isFuture}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                    borderColor: event.completed
                        ? colour
                        : isFuture
                            ? "#d2d2d4"
                            : "lightgrey",

                    background: event.completed ? colour : "transparent",

                    cursor: isFuture ? "not-allowed" : "pointer",
                    opacity: isFuture ? 0.4 : 1,
                }}
                title=
                {isFuture
                    ? "No puedes completar eventos futuros"
                    : event.completed
                        ? "Desmarcar"
                        : "Marcar como completado"}
            >
                {event.completed && (
                    <svg className="w-4 h-3" viewBox="0 0 12 12" fill="none">
                        <path
                            d="M2 6l3 3 5-5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}

                {!event.completed && isPastOrToday && (
                    <div className="w-2 h-2 rounded-full bg-red-300" />
                )}
            </button>

            {/* nombre */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                    {event.user_routine_activity?.activity?.name ?? "Actividad"}
                </p>

                {event.user_routine_activity?.activity?.duration && (
                    <p className="text-xs text-gray-500">
                        {event.user_routine_activity.activity.duration} min
                    </p>
                )}
            </div>

            {/* metric */}
            {event.metric_value !== null && event.metric_value !== undefined && (
                <span
                    className="text-xs font-bold px-2 py-1 rounded-lg shrink-0"
                    style={{ background: colour + "20", color: colour }}
                >
                    {Math.round(event.metric_value)}
                </span>
            )}

            <span className="text-gray-300 text-sm shrink-0">›</span>
        </Link>
    );
}

// Routine
export default function Routine() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userRoutines = useSelector(selectUserRoutines);
    const status = useSelector(selectUserRoutinesStatus);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPauseMenu, setShowPauseMenu] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (status === "idle") dispatch(fetchUserRoutines());
    }, [dispatch, status]);

    const token = useSelector(state => state.auth.token);

    // sincronizar la rutina con Google
    const handleSyncGoogle = async () => {
        const res = await fetch(`http://localhost:8000/api/google/sync/${routine.id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });
        const data = await res.json();
        alert(data.message);
    };

    const routine = useMemo(
        () => userRoutines.find(r => r.id === Number(id)),
        [userRoutines, id]
    );

    const events = useMemo(() => {
        if (!routine?.events) return [];
        return [...routine.events].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [routine]);

    const filteredEvents = useMemo(() => {
        if (filter === "pending") return events.filter(e => !e.completed);
        if (filter === "completed") return events.filter(e => e.completed);
        return events;
    }, [events, filter]);

    const completed = events.filter(e => e.completed).length;
    const total = events.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const handleComplete = (event) => {
        if (event.completed) {
            dispatch(uncompleteEvent(event.id));
        } else {
            dispatch(completeEvent({ id: event.id, metric_value: null }));
        }
    };

    const handlePause = async (type) => {
        dispatch(pauseUserRoutine({ id: routine.id, type }));
        await dispatch(fetchUserRoutines());
        setShowPauseMenu(false);
    };

    const handleUnpause = async () => {
        dispatch(unpauseUserRoutine(routine.id));
        await dispatch(fetchUserRoutines());
    };

    const handleDelete = async () => {
        await dispatch(deleteUserRoutine(routine.id));
        navigate("/routines");
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 font-semibold mb-3">Rutina no encontrada</p>
                </div>
            </div>
        );
    }

    const colour = routine.colour;

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

                {/* breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>›</span>
                    <Link to="/routines" className="hover:text-gray-600">Mis rutinas</Link>
                    <span>›</span>
                    <span className="text-gray-600">{routine.routine?.name}</span>
                </div>

                {/* cabecera */}
                <div
                    className="rounded-2xl p-6 mb-5"
                    style={{ background: colour + "12", border: `2px solid ${colour}40` }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ background: colour + "25" }}
                        >
                            {routine.routine?.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black">{routine.routine?.name}</h1>
                            <p className="text-sm text-gray-600 mt-2">{routine.routine?.description}</p>
                            <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-00">
                                <span>📅 Inicio: {formatDate(routine.start_date)} - Fin: {formatDate(routine.end_date)}</span>
                                {routine.paused && (
                                    <span className="font-semibold text-gold">
                                        Rutina pausada hasta {formatDate(routine.paused_until)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* barra de progreso */}
                    <div className="mt-5">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>{completed} de {total} eventos completados</span>
                            <span className="font-bold" style={{ color: colour }}>{pct}%</span>
                        </div>
                        <div className="h-2 bg-white rounded-full">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: colour }}
                            />
                        </div>
                    </div>

                    {/* la primera quote */}
                    {routine.routine?.quotes?.[0] && (
                        <div className="mt-4 pt-4">
                            <p className="text-xs text-gray-500 italic">"{routine.routine.quotes[0]}"</p>
                        </div>
                    )}
                </div>

                {/* acciones */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    <Link
                        to={`/routines/${routine.id}/edit`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm d border border-gray-200 bg-white hover:bg-gray-50"
                    >
                        Editar
                    </Link>

                    <div className="relative">
                        {!routine.paused ? (
                            <>
                                <button
                                    onClick={() => setShowPauseMenu(!showPauseMenu)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50"
                                >
                                    Pausar
                                </button>
                                {showPauseMenu && (
                                    <div className="absolute left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 w-35">
                                        <button
                                            onClick={() => handlePause("day")}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Un día
                                        </button>
                                        <button
                                            onClick={() => handlePause("week")}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Una semana
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handleUnpause}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gold"
                            >
                                Despausar
                            </button>
                        )}
                    </div>

                    <button onClick={handleSyncGoogle} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-gold">
                         Google Calendar
                    </button>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-red-100 text-red-400 bg-white hover:bg-red-50"
                        >
                            Eliminar
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">¿Seguro?</span>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600"
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 py-2 rounded-xl text-xs font-bold border bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>

                {/* filtro */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-gray-800">Eventos</h2>
                    <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
                        {[
                            { key: "all", label: "Todos" },
                            { key: "pending", label: "Pendientes" },
                            { key: "completed", label: "Completados" },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold ç"
                                style={filter === f.key
                                    ? { background: "white", color: colour, boxShadow: "0 1px 3px #111111" }
                                    : { color: "grey" }
                                }
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* lista */}
                <div className="space-y-2">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-700 text-sm">
                            No hay eventos en esta categoría.
                        </div>
                    ) : (
                        filteredEvents.map(event => (
                            <EventRow
                                key={event.id}
                                event={event}
                                colour={colour}
                                onComplete={handleComplete}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}