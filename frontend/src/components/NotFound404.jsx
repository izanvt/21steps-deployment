import { Link } from "react-router-dom";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

// 404 para cuando se accede a una página que no existe, con redirección al dashboard
const Forbidden = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
            
            <QuestionMarkCircleIcon className="w-20 h-20 text-rojo mb-4" />

            <h1 className="text-3xl font-semibold text-rojo mb-2">
                Accés inexistent - 404
            </h1>

            <p className="text-gray-600 max-w-md mb-6">
                Aquesta pàgina no existeix.
                Si creus que es tracta d’un error, contacta amb l’equip de suport
                o torna a la pàgina principal.
            </p>

            <div className="flex items-center gap-3">
                <Link
                    to="/"  
                    className="px-5 py-2 rounded-md border border-azul text-azul font-medium"
                >
                    Tornar a l’inici
                </Link>
            </div>
        </div>
    );
};

export default Forbidden;