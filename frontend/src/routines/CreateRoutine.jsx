import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchRoutines, createUserRoutine } from "./thunks";
import { selectTemplates, selectTemplatesStatus, selectCreateStatus, selectCreateError, resetCreateStatus } from "./routinesSlice";

const COLORES = [
    "#3AA640", "#177E89", "#D3A900", "#035800",
    "#7C5CBF", "#D44D8A", "#0A2D53", "#E66B43",
    "#E68A00", "#F30000",
];

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

// campos específicos de cada rutina. se gestionan en frontend ya que sirven para generar los datos que después estaŕan en la database. 
const METADATA_FIELDS = {
    minutes: [
        { key: "minutes_per_day", type: "range", label: "Minutos de lectura al día", min: 10, max: 120, unit: "min" },
        { key: "book_pages", type: "number", label: "Páginas del libro (opcional)", placeholder: "ej: 320" },
    ],
    cigarettes: [
        { key: "cigarettes_per_day", type: "number", label: "Cigarrillos que fumas al día actualmente", placeholder: "ej: 10" },
    ],
};

function getFrequency(routine) {
    if (!routine) return "weekly";
    if (routine.activities?.length === 21) return "daily-unique";
    if (routine.metric_type === "minutes" || routine.metric_type === "cigarettes") return "daily";
    return "weekly";
}

// alcula cuanto se tardara en leer un libro de x páginas, contando 2 páginas cada 3 minutos
function calcReadingEstimate(pages, mins) {
    if (!pages || !mins) return null;
    const pagesPerSession = Math.round((mins / 60) * 40);
    return { days: Math.ceil(pages / pagesPerSession), pagesPerSession };
}


// crea la barra deslizable para seleccionar una cantidad de minutos que leer al día
function DynamicField({ field, value, onChange }) {
    if (field.type === "range") {
        return (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                    <span className="text-sm font-bold px-2 py-0.5 rounded-lg text-green">
                        {value || field.min} {field.unit}
                    </span>
                </div>
                <input
                    type="range" min={field.min} max={field.max}
                    value={value || field.min}
                    onChange={e => onChange(field.key, Number(e.target.value))}
                    className="w-full accent-green"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{field.min}</span><span>{field.max}</span>
                </div>
            </div>
        );
    }
    return (
        <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
            <input
                type="number" placeholder={field.placeholder} value={value || ""}
                onChange={e => onChange(field.key, Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-white"
            />
        </div>
    );
}

// selector de días (tanto para un día a la semana como para varios) - funciona así:
// singleMode = false > multi-actividad (ejercicio, respiración)
// singleMode = true  > día único (resumen semanal)
function DayPicker({ label, hint, activities, colour, activityDays, onToggle, singleMode = false, onSingleChange }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            {label && <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>}
            {hint && <p className="text-xs text-gray-400 mb-5">{hint}</p>}

            <div className="space-y-5">
                {activities.map((act, i) => {
                    const selected = singleMode ? activityDays : (activityDays[act.id] ?? []);
                    const isLast = i === activities.length - 1;

                    return (
                        <div key={act.id ?? i} className={!isLast ? "pb-5 border-b border-gray-100" : ""}>
                            {!singleMode && (
                                <>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold text-gray-800">{act.name}</p>
                                        {act.duration && (
                                            <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-lg">
                                                {act.duration} min
                                            </span>
                                        )}
                                    </div>
                                    {act.description && (
                                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">{act.description}</p>
                                    )}
                                </>
                            )}

                            <div className="flex gap-2 flex-wrap">
                                {DIAS.map((d, idx) => {
                                    const isSelected = singleMode ? selected === idx : selected.includes(idx);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => singleMode ? onSingleChange(idx) : onToggle(act.id, idx)}
                                            className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                                            style={{
                                                background: isSelected ? colour : "#F3F4F6",
                                                color: isSelected ? "white" : "#6B7280",
                                            }}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>

                            {singleMode && selected === null && <p className="text-xs text-red-400 mt-2">Escoge un día</p>}
                            {!singleMode && selected.length === 0 && <p className="text-xs text-red-400 mt-2">Asigna al menos un día</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// CreateRoutine
export default function CreateRoutine() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const templates = useSelector(selectTemplates);
    const templatesStatus = useSelector(selectTemplatesStatus);
    const createStatus = useSelector(selectCreateStatus);
    const createError = useSelector(selectCreateError);

    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState(null);
    const [colour, setColour] = useState(COLORES[0]);
    const [metadata, setMetadata] = useState({});
    const [activityDays, setActivityDays] = useState({});
    const [resumenDay, setResumenDay] = useState(null);

    useEffect(() => {
        if (templatesStatus === "idle") dispatch(fetchRoutines());
    }, [dispatch, templatesStatus]);

    useEffect(() => {
        if (createStatus === "succeeded") {
            dispatch(resetCreateStatus());
            navigate("/");
        }
    }, [createStatus, dispatch, navigate]);

    // se definen los helpers anteriores en la función principal
    const freq = useMemo(() => getFrequency(selected), [selected]);
    const metaFields = useMemo(() => METADATA_FIELDS[selected?.metric_type] ?? [], [selected]);
    const resumenAct = useMemo(() => selected?.activities?.find(a => a.name === "Resumen semanal"), [selected]);
    const readingEstimate = useMemo(() =>
        selected?.metric_type === "minutes"
            ? calcReadingEstimate(metadata.book_pages, metadata.minutes_per_day)
            : null,
        [selected, metadata.book_pages, metadata.minutes_per_day]
    );

    const handleMetaChange = (key, val) => setMetadata(prev => ({ ...prev, [key]: val }));

    const toggleActivityDay = (actId, dayIdx) =>
        setActivityDays(prev => {
            const current = prev[actId] ?? [];
            const updated = current.includes(dayIdx)
                ? current.filter(d => d !== dayIdx)
                : [...current, dayIdx];
            return { ...prev, [actId]: updated };
        });

    const resetConfig = () => { setActivityDays({}); setMetadata({}); setResumenDay(null); };


    // solo se puede crear la rutina si se cumplen las condiciones
    const canProceed = () => {
        if (!selected) return false;
        if (freq === "weekly")
            return selected.activities?.every(act => (activityDays[act.id]?.length ?? 0) > 0) ?? false;
        if (selected.metric_type === "minutes")
            return !!metadata.minutes_per_day && resumenDay !== null;
        return true;
    };

    // construye la estructura dependiendo de la frecuencia
    const buildPayload = () => {
        // daily-unique se gestiona desde backend
        if (freq === "daily-unique") {
            return { routine_id: selected.id, colour, target_value: null, activities: [] };
        }

        // construir actividades directamente
        const activities = [];

        if (freq === "daily" && selected.metric_type === "minutes") {
            const sesion = selected.activities?.find(a => a.name === "Sesión de lectura");
            const resumen = selected.activities?.find(a => a.name === "Resumen semanal");
            const rDay = resumenDay ?? 6;
            if (sesion) activities.push({ activity_id: sesion.id, days_of_week: [0,1,2,3,4,5,6].filter(d => d !== rDay) });
            if (resumen) activities.push({ activity_id: resumen.id, days_of_week: [rDay] });
        } else if (freq === "daily") {
            selected.activities?.forEach(act => {
                activities.push({ activity_id: act.id, days_of_week: [0,1,2,3,4,5,6] });
            });
        } else {
            selected.activities?.forEach(act => {
                const days = activityDays[act.id] ?? [];
                if (days.length > 0) activities.push({ activity_id: act.id, days_of_week: days });
            });
        }

        // target_value depende del tipo de métrica
        let targetValue = null;
        if (selected.metric_type === "minutes") targetValue = metadata.minutes_per_day ?? null;
        if (selected.metric_type === "cigarettes") targetValue = metadata.cigarettes_per_day ?? null;

        return { routine_id: selected.id, colour, target_value: targetValue, activities };
    };

    // crea la rutina 
    const handleSubmit = () => dispatch(createUserRoutine(buildPayload()));

    if (templatesStatus === "loading") return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500 text-sm">Cargando el selector...</p>
        </div>
    );
    if (templatesStatus === "failed") return (
        <div className="min-h-screen flex items-center justify-center" >
            <p className="text-red-500 text-sm">Error al cargar las rutinas.</p>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <a href="/" className="hover:text-gray-600">Inicio</a>
                        <span>›</span>
                        <span className="text-gray-600 font-medium">Nueva rutina</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Crea tu rutina</h1>
                </div>

                {/* seleccionamos la rutina */}
                {step === 1 && (
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Elige una rutina</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {templates.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => { setSelected(r); resetConfig(); }}
                                    className="text-left p-4 rounded-2xl border-2 transition-all"
                                    style={{
                                        borderColor: selected?.id === r.id ? colour : "lightgrey",
                                        background: selected?.id === r.id ? colour + "0D" : "white",
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{r.icon}</span>
                                        <div>
                                            <p className="font-bold text-sm">{r.name}</p>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{r.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Color identificativo</p>
                            <div className="flex gap-2 flex-wrap">
                                {COLORES.map(c => (
                                    <button
                                        key={c} onClick={() => setColour(c)}
                                        className="w-8 h-8 rounded-full border-2 transition-transform"
                                        style={{
                                            background: c,
                                            borderColor: colour === c ? "black  " : "transparent",
                                            transform: colour === c ? "scale(1.15)" : "scale(1)",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!selected} onClick={() => setStep(2)}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
                            style={{ background: selected ? colour : "#D1D5DB", opacity: selected ? 1 : 0.6, cursor: selected ? "pointer" : "not-allowed" }}
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* escogemos las fechas (paso 2) */}
                {step === 2 && selected && (
                    <div>
                        {/* cabecera */}
                        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: colour + "15", border: `2px solid ${colour}33` }}>
                            <span className="text-3xl">{selected.icon}</span>
                            <div className="flex-1">
                                <p className="font-black">{selected.name}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">Cambiar</button>
                        </div>

                        {/* ejercicio / respiración */}
                        {freq === "weekly" && (
                            <DayPicker
                                label="Asigna cada actividad a sus días"
                                hint="Escoge en qué días de la semana harás cada actividad"
                                activities={selected.activities ?? []}
                                colour={colour}
                                activityDays={activityDays}
                                onToggle={toggleActivityDay}
                            />
                        )}

                        {/* fumar / sostenible */}
                        {(freq === "daily" || freq === "daily-unique") && selected.metric_type !== "minutes" && (
                            <div className="rounded-2xl p-4 mb-6" style={{ background: colour + "10", border: `1px solid ${colour}30` }}>
                                <p className="text-sm font-semibold" style={{ color: colour }}>📅 Esta rutina se realiza todos los días</p>
                                <p className="text-gray-500 text-xs mt-1">Los eventos se generarán automáticamente para los próximos 21 días.</p>
                            </div>
                        )}

                        {/* lectura */}
                        {selected.metric_type === "minutes" && resumenAct && (
                            <>
                                <div className="rounded-2xl p-4 mb-6" style={{ background: colour + "10", border: `1px solid ${colour}30` }}>
                                    <p className="text-sm font-semibold" style={{ color: colour }}>📅 La sesión de lectura es automática cada día</p>
                                    <p className="text-gray-500 text-xs mt-1">Excepto un día para el resumen semanal.</p>
                                </div>
                                <DayPicker
                                    label="¿Qué día harás el resumen semanal?"
                                    hint="Ese día se sustituirá la sesión de lectura por el resumen."
                                    activities={[resumenAct]}
                                    colour={colour}
                                    activityDays={resumenDay}
                                    singleMode
                                    onSingleChange={setResumenDay}
                                />
                            </>
                        )}

                        {/* si hay metadatos aparece el slider */}
                        {metaFields.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                                <p className="text-sm font-semibold text-gray-700 mb-5">Personaliza tu rutina</p>
                                {metaFields.map(field => (
                                    <DynamicField key={field.key} field={field} value={metadata[field.key]} onChange={handleMetaChange} />
                                ))}
                            </div>
                        )}

                        {/* estimación lectura */}
                        {readingEstimate && (
                            <div className="rounded-2xl p-5 mb-6" style={{ background: "#7ff38410", border: "1px solid grey" }}>
                                <p className="text-sm font-semibold mb-1 text-green">Estimación de lectura</p>
                                <p className="text-gray-600 text-sm">
                                    A <strong>{metadata.minutes_per_day} min/día</strong> leerás unas <strong>{readingEstimate.pagesPerSession} páginas</strong> por sesión.
                                    {metadata.book_pages && <> Acabarás el libro en aproximadamente <strong className="text-green">{readingEstimate.days} días</strong>
                                        {readingEstimate.days <= 21 ? ", ¡durante la rutina!" : ", aunque la rutina dura 21 días."}</>}
                                </p>
                            </div>
                        )}

                        {/* plan tabaco */}
                        {selected.metric_type === "cigarettes" && metadata.cigarettes_per_day > 0 && (
                            <div className="rounded-2xl p-5 mb-6" >
                                <p className="text-sm font-semibold mb-3 text-gold"> Tu plan de reducción</p>
                                {[
                                    { semana: "Semana 1", max: Math.max(Math.round(metadata.cigarettes_per_day * 0.7), 3) },
                                    { semana: "Semana 2", max: Math.max(Math.round(metadata.cigarettes_per_day * 0.4), 1) },
                                    { semana: "Semana 3", max: 0 },
                                ].map(({ semana, max }) => (
                                    <div key={semana} className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">{semana}</span>
                                        <span className="text-sm font-bold text-gold">
                                            ≤ {max} al día
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* errores */}
                        {createStatus === "failed" && createError && (
                            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
                                <p className="text-sm text-red-600">{createError}</p>
                            </div>
                        )}

                        {/* botones */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)} disabled={createStatus === "loading"}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-300 text-gray-600 bg-white hover:bg-gray-100"
                            >
                                Atrás
                            </button>
                            <button
                                disabled={!canProceed() || createStatus === "loading"}
                                onClick={handleSubmit}
                                className="py-3.5 px-8 rounded-xl text-white font-bold text-sm"
                                style={{
                                    flex: 2,
                                    background: canProceed() ? colour : "lightgrey",
                                    opacity: canProceed() && createStatus !== "loading" ? 1 : 0.8,
                                }}
                            >
                                {createStatus === "loading" ? "Creando..." : "Crear rutina"}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}