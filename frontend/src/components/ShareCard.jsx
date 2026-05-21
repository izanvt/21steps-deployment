import { useState } from "react";

const APP_URL = "https://21steps-deployment-production.up.railway.app"

export default function ShareCard({ profile }) {
    const [copied, setCopied] = useState(false);

    const shareUrl = `${APP_URL}/u/${profile.share_token}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // botón para compartir si el navegador lo permite, si no funciona como copia
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${profile.name} en 21Steps`,
                text:  `¡Mira mi perfil en 21Steps! Conectemos y empecemos a conseguir badges juntos!`,
                url:   shareUrl,
            });
        } else {
            handleCopy();
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-black text-gray-800 mb-1">Compartir perfil</h2>
            <p className="text-xs text-gray-400 mb-4">
                Quien tenga este enlace podra ver tu perfil y enviarte una solicitud de amistad.
            </p>

            {/* flyer */}
            <div
                className="rounded-2xl p-5 mb-4 text-white text-center"
                style={{ background: "linear-gradient(150deg, #E0BE36, #3AA640)" }}
            >
                <p className="font-black text-xl">{profile.name}</p>
                {profile.bio && <p className="text-white text-sm mt-1 italic">"{profile.bio}"</p>}
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                    {profile.badges?.slice(0, 3).map(b => (
                        <span key={b.id} className="text-sm  px-2 py-1 rounded-full">
                            {b.icon} {b.name}
                        </span>
                    ))}
                </div>
                <p className="text-white/50 text-xs mt-3">21Steps - Izan Vilas</p>
            </div>

            {/* link */}
            <div className="flex gap-2">
                <div className="flex-1 px-3 py-3 rounded-xl border border-gray-200 text-xs">
                    {shareUrl}
                </div>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shrink-0 bg-blue"
                >
                    {copied ? "✓ Copiado" : "Copiar"}
                </button>
                <button
                    onClick={handleShare}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                    Compartir
                </button>
            </div>
        </div>
    );
}