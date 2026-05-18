import { Outlet, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../auth/authSlice";

import AccessibilityToolbar from "./AccessibilityToolbar";

// Footer y Header aquí, para evitar repetir código multiples veces
export default function MainLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem("user")); }
        catch { return null; }
    })();

    // cerrar menú al hacer clic fuera
    useEffect(() => {
        if (!menuOpen) return;
        const close = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [menuOpen]);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/auth");
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F8FFFE" }}>
        
        <AccessibilityToolbar/>

            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* logo */}
                    <div className="flex items-center gap-2 font-black text-lg text-green-600">
                        <img
                            src="/logo.png"
                            alt="21Steps"
                            className="h-20 w-auto"

                        />
                    </div>

                    {/* nav */}
                    <nav className="hidden md:flex items-center gap-13">
                        <Link to="/">Inicio</Link>
                        <Link to="/routines">Mis rutinas</Link>
                        <Link to="/friends">Amigos</Link>
                        <Link to="/journal">Diario</Link>
                    </nav>

                    <div className="flex items-center gap-3">

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>

                                <span className="hidden sm:block text-sm font-medium">
                                    {user?.name || "usuario"}
                                </span>
                                <span>▾</span>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50">
                                    <Link to="/profile" className="block px-4 py-2 text-sm">Mi perfil</Link>
                                    <Link to="/badges" className="block px-4 py-2 text-sm">Badges</Link>
                                    {user?.role_id === 2 && (
                                    <Link to="/admin" className="block px-4 py-2 text-sm text-blue"> Admin </Link> 
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-500"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* contenido */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* FOOTER */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-sm">
                    <span className="font-black">21 Steps</span>

                    <div className="flex gap-6">
                        <Link to="/about">Sobre nosotros</Link>
                        <Link to="/contact">Contacto</Link>
                    </div>

                    <span>© 21Steps - Izan Vilas</span>
                </div>
            </footer>
        </div>
    );
}