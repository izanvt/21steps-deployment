import { useState } from "react";
import { Link } from "react-router-dom";

// al ser una landing page sin valores reales los definimos de forma estática
const FEATURES = [
    {
        icon: "🗓️",
        title: "Calendario inteligente",
        desc: "Visualiza tu rutina en un calendario mensual, donde identificas a cada rutina por su color.",
    },
    {
        icon: "🔥",
        title: "Acumula tu racha",
        desc: "Mantén tu racha activa no saltandote ninguna tarea.",
    },
    {
        icon: "👥",
        title: "Una gran comunidad",
        desc: "Añade amigos, comparte tu progreso y revisa su perfil.",
    },
    {
        icon: "🏅",
        title: "Badges y logros",
        desc: "Desbloquea insignias al alcanzar hitos, como completar 3 rutinas.",
    },
];

// colores de la guía de estilos
const ROUTINES = [
    { icon: "💪", name: "Ejercicio físico", color: "#3AA640" },
    { icon: "🚬", name: "Dejar de fumar", color: "#E0BE36" },
    { icon: "😮‍💨", name: "Respiración y calma", color: "#177E89" },
    { icon: "📚", name: "Hábito de lectura", color: "#E0BE36" },
    { icon: "🌱", name: "Rutina sostenible", color: "#3AA640" },
    { icon: "❔", name: "Más habitos proximamente", color: "#177E89" },
];

// faqs para darle más realimso
const FAQS = [
    {
        q: "¿Por qué cada habito dura 21 días?",
        a: "El neurocientífico Maxwell Maltz argumento que el cerebro necesita un mínimo de 21 días de repetición para empezar a formar nuevas conexiones neuronales. Aunque su teoria ha sido rebatida, 21 dias es un punto atractivo, sencillo sin ser irrelevante, para empezar a formar nuevos hábitos.",
    },
    {
        q: "¿Puedo pausar una rutina si tengo un imprevisto?",
        a: "Sí. Puedes pausar tu rutina un día o una semana completa. Los días se reorganizan automáticamente.",
    },
    {
        q: "¿21 Steps es gratuito?",
        a: "Sí, 21Steps es completamente gratuito, y no cuenta con anuncios.",
    },
    {
        q: "¿Puedo utilizar calendarios externos?",
        a: "Sí. Al crear una rutina puedes sincronizarla con Google Calendar para recibir recordatorios. Se estudiaran otras aplicaciones en el futuro.",
    },
    {
        q: "Me encanta la app, ¿puedo invitar a mis amigos?",
        a: "Claro que si! En tu perfil encontrarás el enlace que puedes compartir para conectar con tus amigos y visualizar sus rutinas y logros.",
    },
    {
        q: "¿Es 21 ambientalmente responsable?",
        a: "Por supuesto. Aplicamos los criterios de sostenibilidad ASG y promovemos la sostenibilidad activamente con la rutina sostenible, que te ayuda a reducir tu huella medioambiental.",
    },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="border-b border-gray-100 cursor-pointer"
            onClick={() => setOpen(!open)} // !open es un booleano, si estaba abierto = cerrado y viceversa
        >
            <div className="flex justify-between items-center py-5 ">
                <span className="font-semibold text-gray-800 text-lg">{q}</span>
                <span className="text-blue">
                    {open ? "−" : "+"}
                </span>
            </div>
            <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open ? "200px" : "0px" }} // se controla la visibilidad con open
            >
                <p className="text-gray-600 pb-3">{a}</p>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* nav distinto al layout principal */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
                <div className="max-w-5xl mx-auto h-28 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/">
                            <img src="/logo.png" alt="Logo" className="h-28 w-auto" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a
                            href="#caracteristicas"
                            className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
                        >
                            Características
                        </a>

                        <a
                            href="#rutinas"
                            className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
                        >
                            Rutinas
                        </a>

                        <a
                            href="#faq"
                            className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
                        >
                            FAQ
                        </a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="/auth"
                            className="font-semibold px-4 py-2 rounded-lg transition-colors text-blue"
                        >
                            Iniciar sesión
                        </a>
                        <a
                            href="/auth"
                            className="font-semibold px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90 bg-green"
                        >
                            Registrarse
                        </a>
                    </div>

                    <button
                        className="md:hidden p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <div className="space-y-1.5">
                            <span className="block w-6 h-0.5 bg-gray-700" />
                            <span className="block w-6 h-0.5 bg-gray-700" />
                            <span className="block w-6 h-0.5 bg-gray-700" />
                        </div>
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
                        <a href="#caracteristicas" className="block text-gray-600 py-1">
                            Características
                        </a>

                        <a href="#rutinas" className="block text-gray-600 py-1">
                            Rutinas
                        </a>

                        <a href="#faq" className="block text-gray-600 py-1">
                            FAQ
                        </a>

                        <a href="/auth" className="block font-semibold py-2 text-blue"
                        >
                            Iniciar sesión
                        </a>

                        <a href="/auth" className="block text-center px-5 py-2 rounded-lg text-white"
                        >
                            Registrarse
                        </a>
                    </div>
                )}
            </nav>

            {/* hero inicial */}
            <section className="pt-32 pb-24 px-6 relative overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl text-green"
                />
                <div
                    className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl text-blue"
                />

                <div className="max-w-4xl py-4 mx-auto text-center">
                    <h1 className="text-7xl font-black mb-9 tracking-tight">
                        Cambia un hábito en{" "}
                        <span className="relative inline-block text-green">
                            21 días
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-9">
                        21Steps es tu compañero de hábitos. Elige una rutina, sigue el
                        plan día a día y observa cómo tu cerebro cambia en tres semanas.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="/auth"
                            className="px-8 py-4 rounded-lg text-white bg-green font-bold text-lg shadow-lg hover:opacity-85"
                        >
                            Empezar gratis
                        </a>

                        <a href="#caracteristicas"
                            className="px-8 py-4 rounded-lg font-bold text-lg border-2 border-blue text-blue"
                        >
                            Ver cómo funciona
                        </a>
                    </div>
                </div>
            </section>

            {/* características */}
            <section id="caracteristicas" className="py-24 px-6" style={{ background: "#F8FFFE" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Te ayudamos a completar
                            <span className="text-green"> tus objetivos</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {FEATURES.map(({ icon, title, desc }) => (
                            <div
                                key={title}
                                className="bg-white p-4 hover:shadow-md"
                            >
                                <div
                                    className="text-3xl mb-3 w-12 h-12"
                                >
                                    {icon}
                                </div>
                                <h3 className="font-bold text-lg mb-3">{title}</h3>
                                <p className="text-gray-600 text-sm"> {desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* rutinas */}
            <section id="rutinas" className="py-16 px-6" style={{ background: "#fdedf2b0" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Elige tu próximo
                            <span className="text-blue"> reto</span>
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Rutinas prediseñadas con objetivos claros
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {ROUTINES.map(({ icon, name, color }) => (
                            <div
                                key={name}
                                className="rounded-2xl p-6 text-white text-center hover:scale-105"
                                style={{ background: color }}
                            >
                                <div className="text-3xl mb-3">{icon}</div>
                                <div className="font-semibold text-sm">{name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                            Preguntas frecuentes
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Si tienes más dudas, escríbenos desde la sección "Contacto".
                        </p>
                    </div>
                    <div>
                        {FAQS.map((faq) => (
                            <FAQItem key={faq.q} {...faq} />
                        ))}
                    </div>
                </div>
            </section>

            {/* invitación */}
            <section className="py-24 px-6" style={{ background: "#F0FDF4" }}>
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-gray-900 mb-4">
                        Tu hábito empieza{" "}
                        <span className="text-green"> hoy </span>
                    </h2>
                    <p className="text-gray-500 text-lg mb-8">
                        21 días para dar el primer paso que cambiara tu vida.
                    </p>
                    <a
                        href="/auth"
                        className="inline-block px-10 py-4 rounded-lg text-white font-bold text-lg hover:opacity-85 bg-green">
                        Registrate ya
                    </a>
                </div>
            </section>

            {/* footer (al estar fuera de MainLayout se define a mano) */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-sm">
                    <span className="font-black">21 Steps</span>

                    <div className="flex gap-6">
                        <a href="/about">Sobre nosotros</a>
                        <a href="/contact">Contacto</a>
                    </div>

                    <span>© 21Steps - Izan Vilas</span>
                </div>
            </footer>
        </div>
    );
}