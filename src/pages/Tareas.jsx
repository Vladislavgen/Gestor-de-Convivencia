import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useTareas } from "../hooks/useTareas";
import { formatearFecha, hoy } from "../utils/formato";
import "./Tareas.css";

function Tareas() {
  const { usuario, hogar } = useAuth();
  const { tareas, cargando, error: errorCarga } = useTareas(hogar.id);

  const [filtro, setFiltro] = useState("pendientes");
  const [error, setError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [responsable, setResponsable] = useState(usuario.uid);
  const [fechaLimite, setFechaLimite] = useState(hoy());
  const [errorForm, setErrorForm] = useState("");

  const coleccionTareas = collection(db, "hogares", hogar.id, "tareas");

  const nombreDe = (uid) => {
    const miembro = hogar.miembros.find((m) => m.uid === uid);
    return miembro ? miembro.nombre : "Ex miembro";
  };

  const agregarTarea = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setErrorForm("Escribí qué hay que hacer");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaLimite)) {
      setErrorForm("Elegí una fecha límite válida");
      return;
    }

    setErrorForm("");
    try {
      await addDoc(coleccionTareas, {
        titulo: titulo.trim(),
        responsable,
        fechaLimite,
        hecha: false,
        creadoPor: usuario.uid,
        creadoEn: serverTimestamp(),
      });
      setTitulo("");
      setFechaLimite(hoy());
    } catch (err) {
      console.error(err);
      setErrorForm("No se pudo guardar la tarea");
    }
  };

  const cambiarEstado = async (tarea) => {
    try {
      await updateDoc(doc(coleccionTareas, tarea.id), { hecha: !tarea.hecha });
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la tarea");
    }
  };

  const eliminarTarea = async (tarea) => {
    const confirmar = window.confirm(`¿Eliminar la tarea "${tarea.titulo}"?`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(coleccionTareas, tarea.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la tarea");
    }
  };

  const tareasFiltradas = tareas.filter((tarea) => {
    if (filtro === "pendientes") return !tarea.hecha;
    if (filtro === "hechas") return tarea.hecha;
    return true;
  });

  const estaVencida = (tarea) => !tarea.hecha && tarea.fechaLimite < hoy();

  const pendientes = tareas.filter((t) => !t.hecha).length;
  const vencidas = tareas.filter(estaVencida).length;

  return (
    <div className="tareas">
      <div className="encabezado">
        <div>
          <h1>Tareas de {hogar.nombre}</h1>
          <p>
            {pendientes} {pendientes === 1 ? "pendiente" : "pendientes"}
            {vencidas > 0 && `, ${vencidas} ${vencidas === 1 ? "vencida" : "vencidas"}`}
          </p>
        </div>
      </div>

      <div className="grid-2">
        <form className="card" onSubmit={agregarTarea} noValidate>
          <h2>Nueva tarea</h2>

          <label htmlFor="titulo">Qué hay que hacer</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Sacar la basura, limpiar el baño..."
          />

          <div className="fila">
            <div>
              <label htmlFor="responsable">Responsable</label>
              <select
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              >
                {hogar.miembros.map((miembro) => (
                  <option key={miembro.uid} value={miembro.uid}>
                    {miembro.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fechaLimite">Fecha límite</label>
              <input
                id="fechaLimite"
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </div>
          </div>

          {errorForm && <p className="error">{errorForm}</p>}

          <div className="acciones">
            <button type="submit" className="btn btn-primario">
              Agregar tarea
            </button>
          </div>
        </form>

        <div className="card">
          <div className="tareas-encabezado">
            <h2>Lista</h2>
            <div className="tareas-filtros">
              {[
                ["pendientes", "Pendientes"],
                ["hechas", "Hechas"],
                ["todas", "Todas"],
              ].map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  type="button"
                  className={`btn btn-chico ${filtro === valor ? "btn-primario" : "btn-secundario"}`}
                  onClick={() => setFiltro(valor)}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          {cargando && <p className="cargando">Cargando tareas...</p>}
          {errorCarga && <p className="error">{errorCarga}</p>}
          {error && <p className="error">{error}</p>}

          {!cargando && tareasFiltradas.length === 0 && (
            <p className="vacio">
              {tareas.length === 0
                ? "Todavía no hay tareas. Agregá la primera con el formulario."
                : "No hay tareas en esta lista."}
            </p>
          )}

          <ul className="tarea-lista">
            {tareasFiltradas.map((tarea) => (
              <li
                key={tarea.id}
                className={`tarea-item ${tarea.hecha ? "tarea-hecha" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={tarea.hecha}
                  onChange={() => cambiarEstado(tarea)}
                  aria-label={`Marcar "${tarea.titulo}" como ${tarea.hecha ? "pendiente" : "hecha"}`}
                />
                <div className="tarea-info">
                  <strong>{tarea.titulo}</strong>
                  <span className="tarea-detalle">
                    {nombreDe(tarea.responsable)}, vence{" "}
                    {formatearFecha(tarea.fechaLimite)}
                    {estaVencida(tarea) && (
                      <span className="badge badge-error">Vencida</span>
                    )}
                    {tarea.hecha && <span className="badge badge-ok">Hecha</span>}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-chico btn-peligro"
                  onClick={() => eliminarTarea(tarea)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Tareas;
