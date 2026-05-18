import { useState, useEffect } from "react";

// tamaños de texto
const FONT_SIZES = {
    small: { label: "A-", scale: "0.9" },
    normal: { label: "A", scale: "1" },
    large: { label: "A+", scale: "1.15" },
    xlarge: { label: "A++", scale: "1.30" },
};

const FONT_SIZE_ORDER = ["small", "normal", "large", "xlarge"];

// aplica los ajustes al <html> mediante clases y variables CSS
function applySettings(settings) {
    const root = document.documentElement;

    // tamaño de texto
    root.style.setProperty("--a11y-font-scale", FONT_SIZES[settings.fontSize].scale);

    // alto contraste
    if (settings.highContrast) {
        root.classList.add("high-contrast");
    } else {
        root.classList.remove("high-contrast");
    }
}

const DEFAULT_SETTINGS = {
    fontSize: "normal",
    highContrast: false,
};

export default function AccessibilityToolbar() {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem("a11y-settings");
            return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    // aplicar settings al montar y cuando cambian
    useEffect(() => {
        applySettings(settings);
        localStorage.setItem("a11y-settings", JSON.stringify(settings));
    }, [settings]);

    const update = (key, value) =>
        setSettings(prev => ({ ...prev, [key]: value }));

    const reset = () => setSettings(DEFAULT_SETTINGS);

    const currentSizeIdx = FONT_SIZE_ORDER.indexOf(settings.fontSize);

    return (
        <>
            {/* botón flotante */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full items-center justify-center text-xl hover:scale-105 bg-blue">
                ♿
            </button>

            {/* panel */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Panel de accesibilidad"
                    className="fixed bottom-20 right-6 z-50 bg-white rounded-xl border border-gray-200 p-5 w-70"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-black text-gray-800 text-sm">Accesibilidad</h2>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar panel de accesibilidad"
                            className="text-gray-600 hover:text-red-600 text-lg"
                        >
                            ×
                        </button>
                    </div>

                    {/* tamaño de texto */}
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">
                            TAMAÑO DEL TEXTO
                        </p>

                        <div className="flex gap-2 items-center justify-between" role="group" aria-label="Tamaño del texto">

                            {/* - */}
                            <button
                                onClick={() => {
                                    const prev = FONT_SIZE_ORDER[Math.max(0, currentSizeIdx - 1)];
                                    update("fontSize", prev);
                                }}
                                disabled={currentSizeIdx === 0}
                                aria-label="Reducir tamaño del texto"
                                className="w-12 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-700 disabled:opacity-40"
                            >
                                −
                            </button>

                            {/* indicador */}
                            <span className="text-xs text-gray-800 font-medium">
                                {FONT_SIZES[settings.fontSize].scale}x
                            </span>

                            {/* + */}
                            <button
                                onClick={() => {
                                    const next = FONT_SIZE_ORDER[Math.min(FONT_SIZE_ORDER.length - 1, currentSizeIdx + 1)];
                                    update("fontSize", next);
                                }}
                                disabled={currentSizeIdx === FONT_SIZE_ORDER.length - 1}
                                aria-label="Aumentar tamaño del texto"
                                className="w-12 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-700 disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    {/* alto contraste */}
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                            CONTRASTE
                        </p>
                        <button
                            onClick={() => update("highContrast", !settings.highContrast)}
                            aria-pressed={settings.highContrast}
                            aria-label= "Activar/Desactivar alto contraste"
                            className="w-full py-2.5 rounded-xl border text-sm font-bold"
                            style={settings.highContrast
                                ? { borderColor: "#111", background: "#111", color: "#FFE500" }
                                : { borderColor: "#E5E7EB", color: "#6B7280" }
                            }
                        >
                            {settings.highContrast ? "Alto contraste activado" : "Alto contraste"}
                        </button>
                    </div>

                    {/* reset */}
                    <button
                        onClick={reset}
                        aria-label="Restablecer configuración de accesibilidad"
                        className="w-full py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                    >
                        Restablecer valores por defecto
                    </button>
                </div>
            )}
        </>
    );
}