export default function About() {
    return (
        <div className="min-h-screen" style={{ background: "#F8FFFE" }}>

            {/* HERO */}
            <section className="px-6 py-20 text-center max-w-2xl mx-auto">
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                    style={{ background: "#F0FDF4", color: "#3AA640" }}
                >
                    🌱 Proyecto con propósito
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                    Sobre <span style={{ color: "#3AA640" }}>21Steps</span>
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed">
                    21Steps nació con una idea simple: el cambio real no requiere grandes gestos,
                    sino pequeños pasos repetidos cada día durante tres semanas.
                </p>
            </section>

            {/* CONTENIDO */}
            <section className="px-6 pb-16 max-w-3xl mx-auto">

                <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                    <h2 className="text-xl font-black text-gray-900 mb-3">¿Por qué 21 días?</h2>
                    <p className="text-gray-500 leading-relaxed">
                        El neurocientífico Maxwell Maltz documentó que el cerebro necesita un mínimo
                        de 21 días de repetición para empezar a automatizar un comportamiento nuevo.
                        No es magia — es neuroplasticidad. 21Steps te acompaña exactamente durante ese período,
                        con estructura, recordatorios y motivación para que no abandones a mitad del camino.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { icon: "🎯", title: "Objetivos claros",   desc: "Cada rutina tiene métricas reales. No 'hacer ejercicio', sino '30 minutos de cardio'." },
                        { icon: "📅", title: "Seguimiento diario", desc: "Un calendario visual que convierte tus hábitos en algo tangible y medible." },
                        { icon: "👥", title: "Compañía",           desc: "Comparte tu progreso, añade amigos y mantén la motivación con la comunidad." },
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                            <div className="text-3xl mb-3">{icon}</div>
                            <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                            <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl p-8" style={{ background: "#177E89" }}>
                    <h2 className="text-xl font-black text-white mb-4">Compromiso sostenible</h2>
                    <p className="text-white/80 leading-relaxed mb-4">
                        La economía verde no trata solo de energías renovables — trata de bienestar humano,
                        social y cultural. Ese es exactamente el núcleo de 21Steps.
                    </p>
                    <p className="text-white/80 leading-relaxed mb-6">
                        Incluimos una rutina diseñada para reducir la huella medioambiental individual:
                        21 pequeños retos diarios basados en fuentes científicas verificables, que generan
                        un cambio real en los hábitos de consumo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {["Sin publicidad", "Datos privados", "IA responsable", "Código eficiente"].map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

            </section>
        </div>
    );
}