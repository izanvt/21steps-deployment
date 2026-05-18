import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserRoutines } from "../routines/thunks";
import { selectUserRoutines, selectUserRoutinesStatus } from "../routines/routinesSlice";
import { Link } from "react-router-dom";

export default function ListRoutines() {
  const dispatch     = useDispatch();
  const userRoutines = useSelector(selectUserRoutines) || [];
  const status       = useSelector(selectUserRoutinesStatus);

  useEffect(() => {
    dispatch(fetchUserRoutines());
  }, [dispatch]);

  const completed = (r) => r.events?.filter(e => e.completed).length ?? 0;
  const total     = (r) => r.events?.length ?? 0;
  const pct       = (r) => total(r) > 0 ? Math.round((completed(r) / total(r)) * 100) : 0;

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* cabecera */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Mis rutinas</h1>
            <p className="text-sm text-gray-400 mt-1">
              {userRoutines.length > 0
                ? `${userRoutines.length} rutina${userRoutines.length > 1 ? "s" : ""} activa${userRoutines.length > 1 ? "s" : ""}`
                : "Aún no has creado ninguna rutina"}
            </p>
          </div>
          <Link
            to="/routines/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold bg-green"
          >
            + Nueva rutina
          </Link>
        </div>

        {/* estado de carga */}
        {status === "loading" && (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando rutinas...</div>
        )}

        {/* placeholder si no hay rutinas */}
        {status !== "loading" && userRoutines.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-gray-600 font-semibold mb-1">Aún no tienes rutinas</p>
          </div>
        )}

        {/* grid */}
        {userRoutines.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userRoutines.map(r => {
              const color    = r.colour;
              const done     = completed(r);
              const todas      = total(r);
              const progress = pct(r);
              const allDone  = todas > 0 && done === todas;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all flex flex-col"
                >
                  {/* header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: color + "20" }}
                    >
                      {r.routine?.icon || "⚡"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-900 truncate text-sm">{r.routine?.name}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Inicio: {r.start_date ? new Date(r.start_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}
                      </p>
                    </div>
                    {allDone ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0 text-green" style={{ background: "#3AA64020"}}>
                        Completada
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0" style={{ background: color + "20", color }}>
                        {progress}%
                      </span>
                    )}
                  </div>

                  {/* descripción */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {r.routine?.description || "..."}
                  </p>

                  {/* estadísticas */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 text-center bg-gray-50 rounded-xl py-2">
                      <p className="text-base font-black text-gray-800">{done}</p>
                      <p className="text-xs text-gray-400">completados</p>
                    </div>
                    <div className="flex-1 text-center bg-gray-50 rounded-xl py-2">
                      <p className="text-base font-black text-gray-800">{todas}</p>
                      <p className="text-xs text-gray-400">totales</p>
                    </div>
                    <div className="flex-1 text-center bg-gray-50 rounded-xl py-2">
                      <p className="text-base font-black" style={{ color }}>
                        {todas - done}
                      </p>
                      <p className="text-xs text-gray-400">pendientes</p>
                    </div>
                  </div>

                  {/* barra de progreso */}
                  <div className="h-1.5 bg-gray-100 rounded-full mb-4 ">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, background: color }}
                    />
                  </div>

                  {/* acciones */}
                  <div className="flex items-center justify-between mt-auto">
                    <Link
                      to={`/routines/${r.id}`}
                      className="text-xs font-bold hover:underline"
                      style={{ color }}
                    >
                      Ver detalle
                    </Link>
                    {r.paused && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">
                        ⏸ Pausada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}