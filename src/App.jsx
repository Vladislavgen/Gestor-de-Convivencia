import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import RutaPrivada from "./components/RutaPrivada";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Inicio from "./pages/Inicio";
import Hogar from "./pages/Hogar";
import Gastos from "./pages/Gastos";
import Balance from "./pages/Balance";
import Tareas from "./pages/Tareas";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="contenedor">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            <Route
              path="/"
              element={
                <RutaPrivada requiereHogar>
                  <Inicio />
                </RutaPrivada>
              }
            />
            <Route
              path="/hogar"
              element={
                <RutaPrivada>
                  <Hogar />
                </RutaPrivada>
              }
            />
            <Route
              path="/gastos"
              element={
                <RutaPrivada requiereHogar>
                  <Gastos />
                </RutaPrivada>
              }
            />
            <Route
              path="/balance"
              element={
                <RutaPrivada requiereHogar>
                  <Balance />
                </RutaPrivada>
              }
            />
            <Route
              path="/tareas"
              element={
                <RutaPrivada requiereHogar>
                  <Tareas />
                </RutaPrivada>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="pie">
          Gestor de Convivencia, trabajo práctico de Plataformas de Desarrollo (2026)
        </footer>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
