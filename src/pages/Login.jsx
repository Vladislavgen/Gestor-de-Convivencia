import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { traducirError } from "../utils/errores";
import "./Auth.css";

function Login() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Si ya está logueado no tiene sentido mostrar el login
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completá el correo y la contraseña");
      return;
    }

    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(traducirError(err.code));
    } finally {
      setEnviando(false);
    }
  };

  const loginConGoogle = async () => {
    setError("");
    setEnviando(true);
    try {
      const resultado = await signInWithPopup(auth, googleProvider);
      const user = resultado.user;
      // Guardamos (o actualizamos) el perfil sin pisar el hogarId
      await setDoc(
        doc(db, "usuarios", user.uid),
        { nombre: user.displayName || user.email, email: user.email },
        { merge: true },
      );
      navigate("/");
    } catch (err) {
      setError(traducirError(err.code));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <div className="card auth-card">
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitulo">
          Ingresá para ver los gastos de tu hogar.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="auth-separador">o</div>

        <button
          type="button"
          className="btn btn-secundario"
          onClick={loginConGoogle}
          disabled={enviando}
        >
          Ingresar con Google
        </button>

        <p className="auth-link">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
