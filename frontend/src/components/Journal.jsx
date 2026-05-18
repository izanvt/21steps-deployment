import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchUserRoutines } from "../routines/thunks";
import { selectUserRoutines, selectUserRoutinesStatus } from "../routines/routinesSlice";
import { formatDate, MONTHS } from "../utils/dates";

export default function Journal() {
    const dispatch = useDispatch();
    const userRoutines = useSelector(selectUserRoutines);
    const status = useSelector(selectUserRoutinesStatus);

    useEffect(() => {
        if (status === "idle") dispatch(fetchUserRoutines());
    }, [dispatch, status]);

    const journalEntries = useMemo(() => {
        let entries = [];
        for (const ur of userRoutines) {
            if (!ur.events) continue;
            for (const event of ur.events) {
                if (event.completed && (event.mood != null || event.notes)) {
                    entries.push({
                        ...event,
                        routineName: ur.routine?.name,
                        routineIcon: ur.routine?.icon,
                        routineColour: ur.colour,
                        activityName: event.user_routine_activity?.activity?.name,
                    });
                }
            }
        }
        // ordenado por fecha descendente
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        return entries;
    }, [userRoutines]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FFFE" }}>
                <p className="text-gray-400 text-sm">Cargando diario...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Mi Diario</h1>
                    <p className="text-gray-500 text-sm">Tus reflexiones y progreso en algunas de tus rutinas</p>
                </div>

                {journalEntries.length === 0 ? (
                    <div className="text-center bg-white rounded-xl p-8">
                        <span className="text-4xl mb-4 block">📓</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Tu diario está vacío</h2>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Completa eventos para añadir tus entradas
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {journalEntries.map(entry => (
                            <Link
                                key={entry.id}
                                to={`/events/${entry.id}`}
                                className="block bg-white rounded-2xl border border-gray-100 p-5"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span>{entry.routineIcon}</span>
                                        <span
                                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                            style={{
                                                background: entry.routineColour + "20",
                                                color: entry.routineColour
                                            }}
                                        >
                                            {entry.routineName}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">{formatDate(entry.date)}</span>
                                </div>

                                <p className="font-semibold text-gray-800 mb-3">{entry.activityName}</p>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    {entry.mood != null && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">
                                                {entry.mood === 1 ? "😫" : entry.mood === 2 ? "😐" : "😃"}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700">
                                                {entry.mood === 1 ? "Me sentí mal" : entry.mood === 2 ? "Me sentí normal" : "Me sentí bien"}
                                            </span>
                                        </div>
                                    )}
                                    {entry.notes && (
                                        <p className="text-sm mt-1">"{entry.notes}"</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
