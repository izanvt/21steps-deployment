import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchUserRoutines, completeEvent, uncompleteEvent } from "../routines/thunks";
import { selectUserRoutines, selectUserRoutinesStatus } from "../routines/routinesSlice";
import { MONTHS, WEEKDAYS } from "../utils/dates";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function MetricInput({ metricType, value, onChange }) {
    if (!metricType) return null;

    const config = {
        minutes: { label: "¿Cuántos minutos has leído?", unit: "min", min: 1, max: 300 },
        cigarettes: { label: "¿Cuántos cigarrillos has fumado hoy?", unit: "cigarrillos", min: 0, max: 100 },
    }[metricType];

    if (!config) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{config.label}</label>
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    min={config.min}
                    max={config.max}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    placeholder="0"
                    className="w-28 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-center focus:outline-none focus:border-green-400"
                />
                <span className="text-sm text-gray-400">{config.unit}</span>
            </div>
        </div>
    );
}

export default function Event() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userRoutines = useSelector(selectUserRoutines);
    const status = useSelector(selectUserRoutinesStatus);

    const [metricValue, setMetricValue] = useState("");
    const [mood, setMood] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "idle") dispatch(fetchUserRoutines());
    }, [dispatch, status]);

    const { event, userRoutine } = useMemo(() => {
        for (const ur of userRoutines) {
            const found = ur.events?.find(e => e.id === Number(id));
            if (found) return { event: found, userRoutine: ur };
        }
        return { event: null, userRoutine: null };
    }, [userRoutines, id]);

    const activity = event?.user_routine_activity?.activity;
    const resource = activity?.resource;
    const metricType = userRoutine?.routine?.metric_type ?? null;
    const colour = userRoutine?.colour ?? "#177E89";
    const dateStr = event?.date ? formatDate(event.date) : "—";
    const isFuture = event?.date ? new Date(event.date) > new Date() : false;

    // seleccionar un quote random
    const randomQuote = useMemo(() => {
        const quotes = userRoutine?.routine?.quotes || [];
        if (!quotes.length) return null;

        return quotes[Math.floor(Math.random() * quotes.length)];
    }, [userRoutine?.routine?.quotes]);

    // Duración efectiva — para lectura usa target_value del usuario, para el resto la de la actividad
    const effectiveDuration = metricType === "minutes"
        ? userRoutine?.target_value ?? null
        : activity?.duration ?? null;

    const durationLabel = metricType === "minutes" ? "min objetivo" : "minutos";

    useEffect(() => {
        if (event?.metric_value != null) setMetricValue(Math.round(event.metric_value));
        if (event?.mood != null) setMood(event.mood);
        if (event?.notes != null) setNotes(event.notes);
    }, [event]);

    const handleToggle = async () => {
        setLoading(true);
        if (event.completed) {
            await dispatch(uncompleteEvent(Number(id)));
        } else {
            await dispatch(completeEvent({
                id: Number(id),
                metric_value: metricValue !== "" ? metricValue : null,
                mood: mood !== null ? mood : null,
                notes: notes.trim() !== "" ? notes.trim() : null,
            }));
        }
        setLoading(false);
        navigate(-1);
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FFFE" }}>
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        );
    }

    if (!event || !userRoutine) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FFFE" }}>
                <div className="text-center">
                    <p className="text-gray-500 font-semibold mb-3">Evento no encontrado</p>
                    <Link to="/" className="text-sm font-bold" style={{ color: "#177E89" }}>← Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10">

                {/* breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>›</span>
                    <Link to="/routines" className="hover:text-gray-600">Mis rutinas</Link>
                    <span>›</span>
                    <Link to={`/routines/${userRoutine.id}`} className="hover:text-gray-600 truncate max-w-32">
                        {userRoutine.routine?.name}
                    </Link>
                    <span>›</span>
                    <span className="text-gray-600 font-medium">Evento</span>
                </div>

                {/* cabecera */}
                <div
                    className="rounded-2xl p-6 mb-6"
                    style={{ background: colour + "12", border: `2px solid ${colour}30` }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">{userRoutine.routine?.icon}</span>
                        <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: colour + "25", color: colour }}
                        >
                            {userRoutine.routine?.name}
                        </span>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-1">
                        {activity?.name ?? "Actividad"}
                    </h1>

                    <p className="text-sm text-gray-400 capitalize mb-4">{dateStr}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {event.completed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#3AA64020", color: "#3AA640" }}>
                                ✓ Completado
                            </span>
                        ) : isFuture ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
                                📅 Programado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-600">
                                ⏳ Pendiente
                            </span>
                        )}
                        {event.cancelled && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-400">
                                ✗ Cancelado
                            </span>
                        )}
                    </div>

                    {/* duración — para lectura muestra el target_value del usuario */}
                    {effectiveDuration && (
                        <div className="bg-white rounded-xl max-w-50 mt-3 border border-gray-100 p-4 text-center">
                            <p className="text-2xl font-black" style={{ color: colour }}>
                                {effectiveDuration}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{durationLabel}</p>
                        </div>
                    )}
                </div>

                {/* quote motivacional */}
                {randomQuote && (
                    <div className="bg-white rounded-2xl p-5 text-center">
                        <p className="text-sm font-medium text-gray-500 italic">
                            "{randomQuote}"
                        </p>
                    </div>
                )}

                {/* descripción */}
                {activity?.description && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">En qué consiste</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                    </div>
                )}

                {/* datos numéricos */}
                <div className="grid grid-cols-2 gap-3 mb-4">

                    {/* metric_value registrado */}
                    {event.metric_value != null && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                            <p className="text-2xl font-black" style={{ color: colour }}>
                                {Math.round(event.metric_value)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {metricType === "minutes" ? "min leídos" : ""}
                                {metricType === "cigarettes" ? "cigarrillos" : ""}
                                {!metricType ? "registrado" : ""}
                            </p>
                        </div>
                    )}
                </div>

                {/* solo si la rutina lo requiere, input métrico */}
                {!event.completed && metricType && (
                    <div className="mb-4">
                        <MetricInput
                            metricType={metricType}
                            value={metricValue}
                            onChange={setMetricValue}
                        />
                    </div>
                )}

                {/* resource de la actividad */}
                {resource && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                        <p className="text-xs font-semibold text-gray-400 mb-3">
                            📎 RECURSO
                        </p>
                        {(resource.path?.includes("youtube.com") || resource.path?.includes("youtu.be")) ? (
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-3">{resource.name}</p>
                                <div className="rounded-xl overflow-hidden aspect-video">
                                    <iframe
                                        src={resource.path.replace("watch?v=", "embed/")}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title={resource.name}
                                    />
                                </div>
                            </div>
                        ) : (
                            <a
                                href={resource.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">{resource.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{resource.path}</p>
                                </div>
                            </a>
                        )}
                    </div>
                )}

                {/* diario / estado de animo (opcional) */}
                {!event.completed && ["Ejercicio físico", "Dejar de fumar", "Respiración y calma"].includes(userRoutine?.routine?.name) && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                        <p className="text-xs font-semibold text-gray-400 tracking-wide mb-3">DIARIO (OPCIONAl)</p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cómo te sientes hoy?</label>
                            <div className="flex items-center gap-3">
                                {[
                                    { value: 1, emoji: "😫", label: "Mal" },
                                    { value: 2, emoji: "😐", label: "Normal" },
                                    { value: 3, emoji: "😃", label: "Bien" }
                                ].map(m => (
                                    <button
                                        key={m.value}
                                        onClick={() => setMood(m.value)}
                                        className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-xl border ${mood === m.value ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'} transition-all`}
                                    >
                                        <span className="text-2xl">{m.emoji}</span>
                                        <span className={`text-xs font-medium ${mood === m.value ? 'text-blue-600' : 'text-gray-400'}`}>{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tus notas</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Escribe como te has sentido hoy en tu rutina..."
                                className="w-full p-3 rounded-xl border border-gray-200 text-sm h-24"
                            />
                        </div>
                    </div>
                )}

                {/* Journal / Estado de Ánimo (Vista Completo) */}
                {event.completed && (event.mood != null || event.notes) && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tu Reflexión</p>
                        {event.mood != null && (
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">
                                    {event.mood === 1 ? "😫" : event.mood === 2 ? "😐" : "😃"}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">
                                    {event.mood === 1 ? "Me sentí mal" : event.mood === 2 ? "Me sentí normal" : "Me sentí bien"}
                                </span>
                            </div>
                        )}
                        {event.notes && (
                            <p className="text-sm text-gray-600 italic">"{event.notes}"</p>
                        )}
                    </div>
                )}

                {/* botón principal — completar o descompletar */}
                {!event.cancelled && !isFuture && (
                    <button
                        onClick={handleToggle}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl text-white font-black text-base transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: event.completed ? "#9CA3AF" : colour }}
                    >
                        {loading
                            ? "Guardando..."
                            : event.completed
                                ? "Marcar como no completado"
                                : "Marcar como completado"}
                    </button>
                )}

                {isFuture && !event.completed && (
                    <div className="w-full py-4 rounded-2xl text-center font-semibold text-sm bg-gray-100 text-gray-400">
                        Este evento aún no ha llegado
                    </div>
                )}

                <button
                    onClick={() => navigate(-1)}
                    className="w-full mt-4 py-3 text-sm font-semibold text-gray-400 hover:text-gray-600"
                >
                    ← Volver
                </button>

            </main>
        </div>
    );
}   