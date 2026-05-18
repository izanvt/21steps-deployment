import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const API_URL = "http://localhost:8000/api";

export default function PublicProfile() {
    const { share_token } = useParams();
    const navigate        = useNavigate();
    const token           = useSelector(state => state.auth.token);

    const [profile,  setProfile]  = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [sending,  setSending]  = useState(false);
    const [sent,     setSent]     = useState(false);
    const [error,    setError]    = useState("");

    useEffect(() => {
        fetch(`${API_URL}/u/${share_token}`, {
            headers: { Accept: "application/json" },
        })
            .then(r => r.json())
            .then(data => setProfile(data))
            .catch(() => setError("Perfil no encontrado."))
            .finally(() => setLoading(false));
    }, [share_token]);

    const handleSendRequest = async () => {
        if (!token) { navigate("/auth"); return; }
        setSending(true);
        const res = await fetch(`${API_URL}/friend-requests`, {
            method:  "POST",
            headers: {
                "Content-Type": "application/json",
                Accept:          "application/json",
                Authorization:   `Bearer ${token}`,
            },
            body: JSON.stringify({ receiver_id: profile.id }),
        });
        if (res.ok) setSent(true);
        else {
            const d = await res.json();
            setError(d.message ?? "Error al enviar solicitud.");
        }
        setSending(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500 text-sm">Cargando perfil...</p>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center" >
            <p className="text-red-500">Perfil no encontrado.</p>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 max-w-lg mx-auto w-full px-6 py-16">

                {/* avatar */}
                <div className="text-center mb-8">
                    <div
                        className="w-18 h-18 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 bg-blue"
                    >
                        {profile.name?.[0]?.toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-black">{profile.name}</h1>
                    {profile.bio && (
                        <p className="text-gray-500 text-sm mt-2 italic">"{profile.bio}"</p>
                    )}
                </div>

                {/* badges */}
                {profile.badges?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                        <p className="text-sm font-semibold mb-3">
                            Badges
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {profile.badges.map(b => (
                                <span
                                    key={b.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-gold"
                                    style={{ background: "#E0BE3620"}}
                                >
                                    {b.icon} {b.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* error */}
                {error && (
                    <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</div>
                )}

                {token ? (
                    sent ? (
                        <div className="w-full py-3.5 rounded-xl text-center font-bold text-sm text-green" style={{ background: "#3AA64015"}}>
                            ✓ Solicitud enviada
                        </div>
                    ) : (
                        <button
                            onClick={handleSendRequest}
                            disabled={sending}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 bg-blue"
>
                            Enviar solicitud de amistad
                        </button>
                    )
                ) : (
                    <div className="text-center">
                        <p className="text-sm mb-6">Regístrate para añadir a {profile.name} como amigo.</p>
                        <button
                            onClick={() => navigate("/auth")}
                            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-green"
                        >
                            Crea tu cuenta ya
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}