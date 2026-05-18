    import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { selectUserRoutines } from "../routines/routinesSlice";
import { fetchUserRoutines } from "../routines/thunks";
import { DAYS, MONTHS } from "../utils/dates";

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return (new Date(year, month, 1).getDay() + 6) % 7; }

// días del calendario
function CalendarDay({ day, month, year, routines, events }) {
    const navigate = useNavigate();
    // string con la fecha en formato YYYY-MM-DD (padStart es para hacer fechas de dos dígitos p.ej mayo = "05" en vez de 5)
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // buscamos ids de las rutinas para ese día en events
    const routineIds = events[key] || [];

    const today = new Date();
    const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

    const dayRoutines = routineIds
        .map(rid => routines.find(r => r.id === rid))
        .filter(Boolean);

    return (
        <div
            onClick={() => navigate(`/day/${key}`)}
            className={`min-h-16 p-2 rounded-xl border transition-all cursor-pointer hover:shadow-sm
                ${isToday ? "border-2" : "border-gray-100 bg-white hover:border-gray-200"}`}
            style={isToday ? { borderColor: "#3AA640", background: "#F0FDF4" } : {}}
        >
            <span className={`text-xs font-bold block mb-1 ${isToday ? "text-green-600" : "text-gray-400"}`}>
                {day}
            </span>
            <div className="flex flex-wrap gap-0.5">
                {dayRoutines.map(r => (
                    <span
                        key={r.id}
                        className="w-2 h-2 rounded-full"
                        style={{ background: r.colour }}
                        title={r.name}
                    />
                ))}
            </div>
        </div>
    );
}

// calendario (mes, cabecera...)
function Calendar({ routines, events }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstWeekday = getFirstDayOfMonth(viewYear, viewMonth);

    // mes anterior
    const prev = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };

    // mes siguiente
    const next = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-800 text-lg">{MONTHS[viewMonth]} {viewYear}</h2>
                <div className="flex gap-2">
                    <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">‹</button>
                    <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">›</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {/* crea espacios vacios donde estan los días antes de empezar el mes */}
                {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} />)}

                {/* crea un CalendarDay por cada día del mes */}
                {Array.from({ length: daysInMonth }).map((_, i) => (
                    <CalendarDay
                        key={i + 1}
                        day={i + 1}
                        month={viewMonth}
                        year={viewYear}
                        routines={routines}
                        events={events}
                    />
                ))}
            </div>
        </div>
    );
}

// tarjeta de rutina — ahora es un Link
function RoutineCard({ routine }) {
    // cogemos el progreso de 0/21 y lo mostramos en el porcentaje más cercano
    const { completed, total } = routine;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Link
            to={`/routines/${routine.id}`}
            className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl">
                    {routine.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{routine.name}</p>
                    <p className="text-xs text-gray-500">{completed} / {total} eventos</p>
                </div>

                {/* color + 22 para distinguir el % del fondo */}
                <span
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: routine.colour + "22", color: routine.colour }}
                >
                    {pct}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: routine.colour }}
                />
            </div>
        </Link>
    );
}

// función principal
export default function Dashboard() {
    const dispatch = useDispatch();
    const userRoutines = useSelector(selectUserRoutines);

    // API Calendar
    const token = useSelector(state => state.auth.token);
    const [googleConnected, setGoogleConnected] = useState(false);


    const [user, setUser] = useState(null);
    // ids de rutinas ocultas en el filtro — vacío = se muestran todas
    const [hiddenFilters, setHiddenFilters] = useState([]);

    useEffect(() => { dispatch(fetchUserRoutines()); }, [dispatch]);

    // recupera el usuario fresco para actualizar la racha (streak)
    useEffect(() => {
        if (!token) return;
        fetch(`http://localhost:8000/api/profile`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })
            .then(r => r.json())
            .then(data => {
                setUser(data);
                localStorage.setItem("user", JSON.stringify(data));
            })
            .catch(() => {
                const stored = localStorage.getItem("user");
                if (stored) setUser(JSON.parse(stored));
            });
    }, [token]);

    // verifica si esta conectado a Google Calendar al cargar, para guardar si esta conectado o no
    useEffect(() => {
        if (!token) return;
        fetch(`http://localhost:8000/api/google/status`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })
            .then(r => r.json())
            .then(data => setGoogleConnected(data.connected ?? false))
            .catch(() => { });
    }, [token]);

    // conexión con Google Calendar
    const handleGoogleConnect = async () => {
        const res = await fetch(`http://localhost:8000/api/google/auth`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });
        const data = await res.json();

        // redirección a la página de google
        window.location.href = data.url;
    };

    // y desconexión
    const handleGoogleDisconnect = async () => {
        await fetch(`http://localhost:8000/api/google/disconnect`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        setGoogleConnected(false);
    };

    // detectar cuando Google redirige de vuelta
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('google') === 'success') {
            setGoogleConnected(true);
            window.history.replaceState({}, '', '/'); // se vuelve a dashboard
        }
    }, []);

    // useMemo hace que solo se vuelva a calcular un valor cuando cambia, mejora rendimiento
    const routines = useMemo(() => userRoutines.map(r => ({
        id: r.id,
        name: r.routine?.name,
        icon: r.routine?.icon,
        colour: r.colour,
        completed: r.events?.filter(e => e.completed).length ?? 0,
        total: r.events?.length ?? 0,
    })), [userRoutines]);

    // rutinas visibles según filtro
    const visibleRoutineIds = useMemo(() =>
        routines.map(r => r.id).filter(id => !hiddenFilters.includes(id)),
        [hiddenFilters, routines]
    );

    // events filtrados por las rutinas visibles
    const events = useMemo(() => {
        const map = {};
        userRoutines.forEach(r => {
            if (!visibleRoutineIds.includes(r.id)) return; // omitir si filtrada
            r.events?.forEach(e => {
                const date = e.date?.split("T")[0];
                if (!date) return;
                if (!map[date]) map[date] = [];
                if (!map[date].includes(r.id)) map[date].push(r.id);
            });
        });
        return map;
    }, [userRoutines, visibleRoutineIds]);

    const streak = user?.streak || 0;

    // toggle de filtro por rutina (ocultar/mostrar)
    const toggleFilter = (id) => {
        setHiddenFilters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const firstName = user?.name
        ? user.name.split(" ")[0].charAt(0).toUpperCase() + user.name.split(" ")[0].slice(1).toLowerCase()
        : "Usuario";

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

                {/* saludo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            Hola, {firstName}!
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90"
                            style={{ background: googleConnected ? "#3AA640" : "#E0BE36" }}
                        >
                            {googleConnected ? "Google Calendar conectado" : "Conectar Google Calendar"}
                        </button>
                        <Link to="/routines/new" className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold bg-green">
                            + Nueva rutina
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* calendario */}
                    <div className="lg:col-span-2">
                        <Calendar routines={routines} events={events} />

                        {/* filtro de rutinas */}
                        {routines.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 px-1 items-center">
                                {routines.map(r => {
                                    const active = !hiddenFilters.includes(r.id);
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => toggleFilter(r.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
                                            style={{
                                                borderColor: active ? r.colour : "lightgrey",
                                                background: active ? r.colour + "15" : "white",
                                                color: active ? r.colour : "#9CA3AF",
                                            }}
                                        >
                                            {/* checkbox */}
                                            <span
                                                className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0"
                                                style={{
                                                    borderColor: active ? r.colour : "lightgrey",
                                                    background: active ? r.colour : "transparent",
                                                }}
                                            >
                                                {active && (
                                                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                                                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </span>
                                            {r.icon} {r.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">

                        {/* racha */}
                        <div className="rounded-2xl p-5 text-white bg-blue">
                            <p className="text-sm font-medium mb-1">Racha actual</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black">{streak}</span>
                                <span className="text-lg opacity-80 pb-1">días 🔥</span>
                            </div>
                            <p className="text-xs opacity-70 mt-3">
                                {streak > 0
                                    ? "¡Sigue así! Completa tus tareas de hoy para mantenerla."
                                    : "Completa tus tareas de hoy para empezar tu racha."}
                            </p>
                        </div>

                        {/* rutinas */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800 text-sm">Rutinas activas</h3>
                                <Link to="/routines" className="text-xs font-semibold text-blue">Ver todas</Link>
                            </div>

                            {routines.length > 0 ? (
                                <div className="space-y-3">
                                    {routines.map(r => <RoutineCard key={r.id} routine={r} />)}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                                    <p className="text-gray-400 text-sm mb-3">No tienes rutinas activas</p>
                                    <Link to="/routines/new" className="text-sm font-semibold text-green">
                                        + Crear una rutina
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}