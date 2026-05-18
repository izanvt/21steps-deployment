import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function FriendCard({ friend, onRemove }) {
    const [confirm, setConfirm] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-gray-800">{friend.name}</p>
                    {friend.bio && <p className="text-gray-500 mt-1 italic truncate">"{friend.bio}"</p>}
                </div>

                {!confirm ? (
                    <button
                        onClick={() => setConfirm(true)}
                        className="text-sm text-red-400 hover:text-red-800"
                    >
                        Eliminar
                    </button>
                ) : (
                    <div className="flex gap-1 shrink-0">
                        <button onClick={() => onRemove(friend.friendship_id)} className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-lg">Sí</button>
                        <button onClick={() => setConfirm(false)} className="text-xs font-bold border border-gray-300 text-gray-600 px-2 py-1 rounded-lg">No</button>
                    </div>
                )}
            </div>

            {/* badges */}
            {friend.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {friend.badges.map(b => (
                        <span key={b.id} className="text-sm px-2 py-0.5 rounded-full text-gold">
                            {b.icon} {b.name}
                        </span>
                    ))}
                </div>
            )}

            {/* rutinas */}
            {friend.routines?.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 tracking-wide">RUTINAS ACTIVAS</p>
                    {friend.routines.map(r => (
                        <div key={r.id} className="flex items-center gap-4">
                            <span className="text-sm">{r.icon}</span>
                            <span className="text-xs text-gray-700 flex-1">{r.name}</span>
                            <div className="w-18 h-1.5 bg-gray-100 rounded-full">
                                <div className="h-full rounded-full" style={{ width: `${r.progress}%`, background: r.colour }} />
                            </div>
                            <span className="text-xs font-bold shrink-0" style={{ color: r.colour }}>{r.progress}%</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-500">Sin rutinas activas.</p>
            )}
        </div>
    );
}

export default function Friends() {
    const token = useSelector(state => state.auth.token);

    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("friends"); // tabs entre friends y requests

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };

    const load = useCallback(() => {
        setLoading(true);

        Promise.all([
            fetch(`${API_URL}/friends`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/friend-requests/pending`, { headers }).then(r => r.json()),
        ])
            .then(([fr, pend]) => {
                setFriends(Array.isArray(fr) ? fr : []);
                setPending(Array.isArray(pend) ? pend : []);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAccept = async (id) => {
        await fetch(`${API_URL}/friend-requests/${id}/accept`, { method: "PATCH", headers });
        load();
    };

    const handleReject = async (id) => {
        await fetch(`${API_URL}/friend-requests/${id}/reject`, { method: "PATCH", headers });
        setPending(prev => prev.filter(r => r.id !== id));
    };

    const handleRemove = async (friendshipId) => {
        await fetch(`${API_URL}/friends/${friendshipId}`, { method: "DELETE", headers });
        setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId));
    };

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Amigos</h1>
                        <p className="text-sm text-gray-400 mt-1">{friends.length} amigo{friends.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* tabs */}
                <div className="flex rounded-xl bg-gray-100 p-1 mb-6 w-fit gap-1">
                    {[
                        { key: "friends", label: "Mis amigos" },
                        { key: "requests", label: `Solicitudes (${pending.length})`
 },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold"
                            style={tab === t.key
                                ? { background: "white", color: "#177E89" }
                                : { color: "grey" }
                            }>
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
                ) : tab === "friends" ? (
                    friends.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                            <p className="text-3xl mb-3">👥</p>
                            <p className="text-gray-600 font-semibold mb-1">Aún no tienes amigos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {friends.map(f => (
                                <FriendCard key={f.id} friend={f} onRemove={handleRemove} />
                            ))}
                        </div>
                    )
                ) : (
                    pending.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                            <p className="text-gray-400 text-sm">No tienes solicitudes pendientes.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map(req => (
                                <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white bg-green"
                                    >
                                        {req.sender?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm">{req.sender?.name}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-green"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}