import { useState } from "react";

const API_URL = "http://localhost:8000/api";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [error, setError] = useState("");

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setError("");

        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                const firstError = data.errors
                    ? Object.values(data.errors)[0][0]
                    : data.message;
                setError(firstError);
                setStatus("error");
            } else {
                setStatus("success");
                setForm({ name: "", email: "", message: "" });
            }
        } catch {
            setError("Error de conexión. Inténtalo de nuevo.");
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
            <main className="flex-1 max-w-lg mx-auto w-full py-16">

                {/* cabecera */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Contacto</h1>
                    <p className="text-gray-400 text-sm">
                        ¿Tienes alguna duda o sugerencia? Escríbenos y te respondemos en breve.
                    </p>
                </div>

                {/* éxito */}
                {status === "success" ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <div className="text-5xl mb-4">📬</div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">¡Mensaje enviado!</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Hemos recibido tu mensaje y te responderemos lo antes posible.
                        </p>
                        <button
                            onClick={() => setStatus("idle")}
                            className="text-sm font-semibold"
                            style={{ color: "#177E89" }}
                        >
                            Enviar otro mensaje
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8">
                        <form onSubmit={submit} className="space-y-5">

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handle}
                                    required
                                    placeholder="Tu nombre"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handle}
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Mensaje
                                </label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handle}
                                    required
                                    rows={5}
                                    placeholder="Escribe tu mensaje aquí..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 transition resize-none"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-50"
                                style={{ background: "#3AA640" }}
                            >
                                {status === "loading" ? "Enviando..." : "Enviar mensaje →"}
                            </button>

                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}