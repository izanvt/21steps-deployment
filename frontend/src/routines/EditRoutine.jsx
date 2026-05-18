import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchUserRoutines, updateUserRoutine } from "../routines/thunks";
import { selectUserRoutines, selectUserRoutinesStatus } from "../routines/routinesSlice";

const COLORES = [
    "#3AA640", "#177E89", "#D3A900", "#035800",
    "#7C5CBF", "#D44D8A", "#0A2D53", "#E66B43",
    "#E68A00", "#F30000",
];

export default function EditRoutine() {
    const { id }   = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userRoutines = useSelector(selectUserRoutines);
    const status       = useSelector(selectUserRoutinesStatus);

    const routine = useMemo(
        () => userRoutines.find(r => r.id === Number(id)),
        [userRoutines, id]
    );

    // form state — inicializado con los datos actuales
    const [colour,      setColour]      = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [saving,      setSaving]      = useState(false);
    const [saved,       setSaved]       = useState(false);

    useEffect(() => {
        if (status === "idle") dispatch(fetchUserRoutines());
    }, [dispatch, status]);

    // rellenar form cuando llegan los datos
    useEffect(() => {
        if (routine) {
            setColour(routine.colour || COLORES[0]);
            setTargetValue(routine.target_value ?? "");
        }
    }, [routine]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        const payload = { id: Number(id), colour };
        if (targetValue !== "") payload.target_value = Number(targetValue);

        await dispatch(updateUserRoutine(payload));
        setSaving(false);
        setSaved(true);

        setTimeout(() => navigate(`/routines/${id}`), 800);
    };

    // ── estados de carga ─────────────────────────────────────────────
    if (status === "loading" || (!routine && status !== "failed")) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FFFE" }}>
                <p className="text-gray-400 text-sm">Cargando...</p>
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FFFE" }}>
                <div className="text-center">
                    <p className="text-gray-500 font-semibold mb-3">Rutina no encontrada</p>
                    <Link to="/routines" className="text-sm font-bold" style={{ color: "#177E89" }}>
                        ← Volver a mis rutinas
                    </Link>
                </div>
            </div>
        );
    }

    // etiqueta del target_value según metric_type
    const metricLabel = {
        minutes:    "Minutos de lectura al día",
        cigarettes: "Cigarrillos al día (punto de partida)",
    }[routine.routine?.metric_type] ?? null;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-xl mx-auto w-full px-6 py-10">

                {/* breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>›</span>
                    <Link to="/routines" className="hover:text-gray-600">Mis rutinas</Link>
                    <span>›</span>
                    <Link to={`/routines/${id}`} className="hover:text-gray-600 truncate max-w-32">
                        {routine.routine?.name}
                    </Link>
                    <span>›</span>
                    <span className="text-gray-600 font-medium">Editar</span>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-1">Editar rutina</h1>
                <p className="text-sm text-gray-400 mb-8">
                    Ajusta el color{metricLabel ? " y tu objetivo" : ""} de tu rutina.
                </p>

                {/* preview de la rutina */}
                <div
                    className="rounded-2xl p-4 mb-8 flex items-center gap-4"
                    style={{ background: colour + "15", border: `2px solid ${colour}30` }}
                >
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: colour + "25" }}
                    >
                        {routine.routine?.icon}
                    </div>
                    <div>
                        <p className="font-black text-gray-800">{routine.routine?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Vista previa con el color seleccionado</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* color */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm font-semibold text-gray-700 mb-4">Color identificativo</p>
                        <div className="flex gap-3 flex-wrap">
                            {COLORES.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColour(c)}
                                    className="w-9 h-9 rounded-full border-2 transition-transform"
                                    style={{
                                        background:  c,
                                        borderColor: colour === c ? "#111" : "transparent",
                                        transform:   colour === c ? "scale(1.2)" : "scale(1)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* target_value — solo si la rutina tiene metric_type */}
                    {metricLabel && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {metricLabel}
                            </label>
                            <p className="text-xs text-gray-400 mb-4">
                                Actualiza tu objetivo si ha cambiado desde que empezaste.
                            </p>
                            <input
                                type="number"
                                min={1}
                                value={targetValue}
                                onChange={e => setTargetValue(e.target.value)}
                                placeholder="ej: 30"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-white"
                            />
                        </div>
                    )}

                    {/* botones */}
                    <div className="flex gap-3">
                        <Link
                            to={`/routines/${id}`}
                            className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 text-center"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || saved}
                            className="py-3.5 rounded-xl text-white font-bold text-sm transition-all"
                            style={{
                                flex:       2,
                                background: saved ? "#3AA640" : colour,
                                opacity:    saving ? 0.7 : 1,
                            }}
                        >
                            {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}