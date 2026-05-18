import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "./thunks";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

// dos funciones para cada formulario para un código más compartimentado
function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const { isLoading, error } = useSelector((state) => state.auth);

  // utilizaremos react-hoook-forms
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap(); // con unwrap mostrara un error real si falla
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/"); // navega al dashboard
    }
  }, [token]);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: /^\S+@\S+$/i, // validación básica correo electrónico
              message: "Correo inválido",
            },
          })}
          className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-1 text-gray-800 placeholder-gray-500 focus:ring-green"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="••••••••"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 8,
              message: "Mínimo 8 caracteres",
            },
          })}
          className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-1 text-gray-800 placeholder-gray-500 focus:ring-green"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-green text-white font-bold transition hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}


// ahora el register
function RegisterForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  // react-hook-forms
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    try {
      await dispatch(registerUser(data));
      onSuccess && onSuccess();
    } catch (err) {
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <input
        type="text"
        placeholder="Tu nombre"
        {...register("name", { required: "El nombre es obligatorio" })}
        className="w-full px-4 py-3 rounded-xl focus:ring-1 text-gray-800"
      />
      {errors.name && (
        <p className="text-sm text-red-500">{errors.name.message}</p>
      )}

      <input
        type="email"
        placeholder="tu@email.com"
        {...register("email", {
          required: "El email es obligatorio",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Correo inválido",
          },
        })}
        className="w-full px-4 py-3 rounded-xl focus:ring-1 text-gray-800"
      />
      {errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder="Mínimo 8 caracteres"
        {...register("password", {
          required: "La contraseña es obligatoria",
          minLength: {
            value: 8,
            message: "Mínimo 8 caracteres",
          },
        })}
        className="w-full px-4 py-3 rounded-xl focus:ring-1 text-gray-800"
      />
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-green text-white font-bold hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>
    </form>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState("login"); // por default muestra el login, más rápido para la mayoría de users con cuenta ya creada
  const [registered, setRegistered] = useState(false);

  return (
    <div className="min-h-screen flex bg-white">
      {/* panel visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white bg-blue">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
        </Link>

        <div>
          <h2 className="text-4xl font-black mb-6">
            La disciplina
            <br />
            empieza aquí.
          </h2>

          <div className="text-lg mb-12">
            <p>Cambios reales en solo tres semanas.</p>
            <p>El desarrollo personal, más fácil y divertido que nunca.</p>
          </div>
        </div>

        <div className="text-white/50 text-sm">© 21Steps - Izan Vilas</div>
      </div>

      {/* panel login/register */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {registered ? (
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                ¡Cuenta creada!
              </h2>

              <p className="text-gray-500 mb-6">
                Revisa tu correo para verificarlo.
              </p>

              <button
                onClick={() => {
                  setRegistered(false);
                  setTab("login");
                }}
                className="text-sm font-semibold text-blue"
              >
                Inicia sesión en tu cuenta
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-5">
                {tab === "login"
                  ? "Bienvenido!"
                  : "Crea tu cuenta ya!"}
              </h1>

              <div className="flex rounded-xl p-1 mb-8 bg-gray-200">
                {["login", "register"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold ${tab === t
                      ? "bg-white text-blue shadow-sm"
                      : "text-gray-500"
                      }`}
                  >
                    {t === "login"
                      ? "Iniciar sesión"
                      : "Registrarse"}
                  </button>
                ))}
              </div>

              {tab === "login" ? (
                <LoginForm />
              ) : (
                <RegisterForm
                  onSuccess={() => setRegistered(true)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}