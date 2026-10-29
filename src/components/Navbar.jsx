import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { usuario, hogar, nombreUsuario } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-contenido">
        <Link to="/" className="navbar-marca">
          Gestor de Convivencia
        </Link>

        {usuario && (
          <>
            <nav className="navbar-links">
              {hogar && (
                <>
                  <NavLink to="/gastos">Gastos</NavLink>
                  <NavLink to="/balance">Balance</NavLink>
                  <NavLink to="/tareas">Tareas</NavLink>
                </>
              )}
              <NavLink to="/hogar">Hogar</NavLink>
            </nav>

            <div className="navbar-usuario">
              <span>{nombreUsuario}</span>
              <button
                type="button"
                className="btn btn-chico btn-secundario"
                onClick={cerrarSesion}
              >
                Salir
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
