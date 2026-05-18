import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// crear una estructura redux para una llamada tan simple sería poco eficiente. las llamadas a la API se haran directamente.
const API_URL = "http://localhost:8000/api";

// cada badge individual
function BadgeCard({ badge, unlocked, unlockedAt }) {
    return (
        <div
            className={`rounded-xl border p-5 text-center ${unlocked
                ? "bg-white border-gray-200 hover:shadow-sm"
                : "bg-gray-50 border-gray-200 opacity-55"
                }`}
        >
            <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
                style={{ background: "#e0be362a" }}
            >
                {unlocked ? badge.icon : "🔒"}
            </div>
            <p className="text-sm font-black mb-1">{badge.name}</p>
            <p className="text-xs text-gray-800 leading-relaxed">{badge.description}</p>
            {unlocked && unlockedAt && (
                <p className="text-xs mt-2 font-semibold text-gold">
                    {new Date(unlockedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </p>
            )}
        </div>
    );
}

export default function Badges() {
    const [allBadges, setAllBadges] = useState([]);
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = useSelector(state => state.auth.token);

    useEffect(() => {
        if (!token) return;
        const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        };

        // dos peticiones a la api a la vez: todas las badges y perfil para conseguir las badges del usuario
        Promise.all([
            fetch(`${API_URL}/badges`, { headers }).then(r => r.json()),
            fetch(`${API_URL}/profile`, { headers }).then(r => r.json()),
        ]).then(([allData, profileData]) => {
            setAllBadges(Array.isArray(allData) ? allData : []);
            setUnlockedBadges(profileData.badges ?? []);
        }).finally(() => setLoading(false));

    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-sm">Cargando badges...</p>
            </div>
        );
    }

    const unlockedIds = unlockedBadges.map(b => b.id);
    const unlockedCount = unlockedBadges.length;
    const totalCount = allBadges.length;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

                {/* breadcrumb (viene de perfil) */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-gray-600">Inicio</Link>
                    <span>›</span>
                    <Link to="/profile" className="hover:text-gray-600">Mi perfil</Link>
                    <span>›</span>
                    <span className="text-gray-600 font-medium">Badges</span>
                </div>

                {/* desbloqueados */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-gray-900 mb-1">Mis badges</h1>
                    <p className="text-gray-400 text-sm">
                        {unlockedCount} de {totalCount} desbloqueados
                    </p>

                    {/* barra de progreso */}
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gold"
                            style={{
                                width: `${totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%`,
                            }}
                        />
                    </div>
                </div>

                {/* desbloqueadas */}
                {unlockedCount > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Conseguidas
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {unlockedBadges.map(badge => (
                                <BadgeCard
                                    key={badge.id}
                                    badge={badge}
                                    unlocked={true}
                                    unlockedAt={badge.pivot?.unlocked_at}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* bloqueadas */}
                {allBadges.filter(b => !unlockedIds.includes(b.id)).length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Por conseguir
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {allBadges
                                .filter(b => !unlockedIds.includes(b.id))
                                .map(badge => (
                                    <BadgeCard
                                        key={badge.id}
                                        badge={badge}
                                        unlocked={false}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
