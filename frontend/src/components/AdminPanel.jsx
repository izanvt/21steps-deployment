import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminPanel() {
    const token = useSelector(state => state.auth.token);
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null); // id del usuario a eliminar

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };

    // hacemos el fetch directamente aqui, para evitar crear un thunks y slice sin necesidad
    const fetchUsers = useCallback(async (q = "") => {
        setLoading(true);
        setError("");
        try {

            // encodeURIComponent recomendación IA - evita romper la URL con carácteres extraños
            const res = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(q)}`, { headers });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 403) navigate("/");
                setError(data.message ?? "Error al cargar usuarios.");
            } else {
                setUsers(data.data ?? []);
            }
        } catch {
            setError("Error de conexión.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    // carga inicial para poder mostrarlos
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleBlock = async (user) => {
        const res = await fetch(`${API_URL}/admin/users/${user.id}/block`, {
            method: "PATCH",
            headers,
        });
        const data = await res.json();
        if (res.ok) {
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, blocked: data.blocked } : u
            ));
        }
    };

    // eliminar un usuario (con confirm)
    const handleDelete = async (id) => {
        const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers,
        });
        if (res.ok) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
        setConfirmDelete(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
                <h1 className="text-2xl font-black text-gray-900">Panel de administración</h1>

                {/* buscador */}
                <div className="relative mb-6 mt-8">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                fetchUsers(search);
                            }
                        }}
                        placeholder="Buscar por nombre o email..."
                        className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-green-400 transition"
                    />
                    <span className="absolute left-3 top-3">🔍</span>
                </div>

                {error && (
                    <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</div>
                )}

                {/* tabla de usuarios */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 text-sm">Cargando usuarios...</div>
                ) : users.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                        <p className="text-gray-600 text-sm">No se encontraron usuarios.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        {/* cabecera tabla */}
                        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-200 text-xs font-¡ text-gray-500 uppercase">
                            <span className="col-span-4">Usuario</span>
                            <span className="col-span-3">Email</span>
                            <span className="col-span-2">Rol</span>
                            <span className="col-span-1">Estado</span>
                            <span className="col-span-2 text-right">Acciones</span>
                        </div>

                        {users.map(user => (
                            <div
                                key={user.id}
                                className="grid grid-cols-12 gap-4 px-5 py-4 items-center"
                            >
                                <div className="col-span-4 flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-800 truncate">{user.name}</span>
                                </div>

                                {/* email */}
                                <span className="col-span-3 text-sm text-gray-500 truncate">{user.email}</span>

                                {/* rol */}
                                <span className="col-span-2">
                                    <span
                                        className="text-xs font-bold px-2 py-1"
                                        style={user.role_id === 2
                                            ? { color: "#B8960E" }
                                            : { color: "#177E89" }}>
                                        {user.role_id === 2 ? "Admin" : "Usuario"}
                                    </span>
                                </span>

                                {/* estado */}
                                <span className="col-span-1">
                                    {user.blocked
                                        ? <span className="text-xs font-bold text-red-500">Bloqueado</span>
                                        : <span className="text-xs font-bold text-green-700">Desbloqueado</span>
                                    }
                                </span>

                                {/* acciones */}
                                <div className="col-span-2 flex items-center justify-end gap-2">
                                    {user.role_id !== 2 && (
                                        <>
                                            <button
                                                onClick={() => handleBlock(user)}
                                                className="text-xs font-semibold px-2 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                                                title={user.blocked ? "Desbloquear" : "Bloquear"}
                                            >
                                                {user.blocked ? "🔓" : "🔒"}
                                            </button>

                                            {confirmDelete === user.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-xs font-bold px-2 py-2 rounded-lg bg-red-500 text-white"
                                                    >
                                                        Sí
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        className="text-xs font-bold px-2 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDelete(user.id)}
                                                    className="text-xs font-semibold px-2 py-2 rounded-lg border border-red-100 hover:bg-red-100"
                                                >
                                                    🗑
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* contador */}
                {!loading && users.length > 0 && (
                    <p className="text-xs text-gray-400 mt-3 text-right">
                        {users.length} usuarios encontrados
                    </p>
                )}
            </main>
        </div>
    );
}