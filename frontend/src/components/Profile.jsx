import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ShareCard from './ShareCard'


const API_URL = "http://localhost:8000/api";

// badge individual
function BadgeCard({ badge }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: "#E0BE3620" }}
            >
                🏅
            </div>
            <p className="text-xs font-bold">{badge.name}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{badge.description}</p>
            {badge.pivot?.unlocked_at && (
                <p className="text-xs text-gray-400 mt-2">
                    {new Date(badge.pivot.unlocked_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            )}
        </div>
    );
}

export default function Profile() {
    const token = useSelector(state => state.auth.token);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // form de edición
    const [form, setForm]       = useState({ name: "", email: "", bio: "" });
    const [saving, setSaving]   = useState(false);
    const [saved,  setSaved]    = useState(false);
    const [error,  setError]    = useState("");

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };

    // cargar perfil al montar
    useEffect(() => {
        fetch(`${API_URL}/profile`, { headers })
            .then(r => r.json())
            .then(data => {
                setProfile(data);
                setForm({ name: data.name ?? "", email: data.email ?? "", bio: data.bio ?? "" });
            })
            .finally(() => setLoading(false));
    }, []);

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError("");

        const res  = await fetch(`${API_URL}/profile`, {
            method:  "PATCH",
            headers,
            body:    JSON.stringify(form),
        });
        const data = await res.json();

        if (!res.ok) {
            const firstError = data.errors
                ? Object.values(data.errors)[0][0]
                : data.message;
            setError(firstError);
        } else {

            // guardamos el perfil con las badges
            setProfile(prev => ({ ...data, badges: prev?.badges ?? [] }));

            // actualizar nombre en localStorage para el saludo del dashboard
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, name: data.name, email: data.email }));
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FFFE" }}>
                <p className="text-gray-400 text-sm">Cargando perfil...</p>
            </div>
        );
    }

    const badges = profile?.badges ?? [];
    const initial = profile?.name?.[0]?.toUpperCase() ?? "U";

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

                {/* breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>›</span>
                    <span className="text-gray-600 font-medium">Mi perfil</span>
                </div>

                {/* avatar + nombre */}
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                        style={{ background: "#177E89" }}
                    >
                        {initial}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{profile?.name}</h1>
                        <p className="text-sm text-gray-400">{profile?.email}</p>
                        {profile?.bio && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{profile.bio}"</p>
                        )}
                    </div>
                </div>

                {profile?.share_token && <ShareCard profile={profile} />}

                {/* formulario de edición */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                    <h2 className="font-black text-gray-800 mb-5">Editar perfil</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handle}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handle}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Biografía
                                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                            </label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handle}
                                rows={3}
                                maxLength={150}
                                placeholder="Cuéntanos algo sobre ti..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-300 text-right mt-1">{form.bio.length}/150</p>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-50"
                            style={{ background: saved ? "#3AA640" : "#177E89" }}
                        >
                            {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>
                </div>

                {/* badges */}
                <div>
                    <h2 className="font-black text-gray-800 mb-4">
                        Mis badges
                        {badges.length > 0 && (
                            <span className="ml-2 text-sm font-semibold text-gray-400">
                                {badges.length} desbloqueado{badges.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </h2>

                    {badges.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <p className="text-gray-600 text-sm">Aún no has desbloqueado ningún badge.</p>
                            <p className="text-gray-400 text-xs mt-1">Completa rutinas y objetivos para conseguirlos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {badges.map(badge => (
                                <BadgeCard key={badge.id} badge={badge} />
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}