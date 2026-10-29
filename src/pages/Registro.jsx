import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { traducirError } from "../utils/errores";
import "./Auth.css";

function Registro() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const validar = () => {
    if (!nombre.trim()) return "Ingresá tu nombre";
    if (!email.trim()) return "Ingresá tu correo";
    if (password.length < 6) return "La contraseña tiene que tener al menos 6 caracteres";
    if (password !== confirmar) return "Las contraseñas no coinciden";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await updateProfile(credencial.user, { displayName: nombre.trim() });

      // Perfil del usuario en Firestore. El hogar se asigna después.
      await setDoc(doc(db, "usuarios", credencial.user.uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        hogarId: null,
      });

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
        <h1>Crear cuenta</h1>
        <p className="auth-subtitulo">
          Después vas a poder crear un hogar o unirte a uno con un código.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Cómo te van a ver los demás"
          />

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
            placeholder="Mínimo 6 caracteres"
          />

          <label htmlFor="confirmar">Repetir contraseña</label>
          <input
            id="confirmar"
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;
