import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protege una ruta: si no hay sesión manda al login.
// Con requiereHogar, además manda a /hogar si el usuario todavía no tiene uno.
function RutaPrivada({ children, requiereHogar = false }) {
  const { usuario, perfil, hogar, cargando } = useAuth();

  if (cargando) {
    return <p className="cargando">Cargando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (requiereHogar) {
    if (!perfil?.hogarId) {
      return <Navigate to="/hogar" replace />;
    }
    if (!hogar) {
      return <p className="cargando">Cargando...</p>;
    }
  }

  return children;
}

export default RutaPrivada;
