import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { formatearFecha, hoy } from "../utils/formato";
import "./Tareas.css";

function Tareas() {
  const { usuario, hogar } = useAuth();

  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("pendientes");
  const [error, setError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [responsable, setResponsable] = useState(usuario.uid);
  const [fechaLimite, setFechaLimite] = useState(hoy());
  const [errorForm, setErrorForm] = useState("");

  const coleccionTareas = collection(db, "hogares", hogar.id, "tareas");

  // Escucha las tareas del hogar en tiempo real
  useEffect(() => {
    const consulta = query(
      collection(db, "hogares", hogar.id, "tareas"),
      orderBy("fechaLimite"),
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        setTareas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar las tareas");
        setCargando(false);
      },
    );

    return unsubscribe;
  }, [hogar.id]);

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
    if (!fechaLimite) {
      setErrorForm("Elegí una fecha límite");
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

  return (
    <div className="tareas">
      <h1>Tareas de {hogar.nombre}</h1>

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
              <button
                type="button"
                className={`btn btn-chico ${filtro === "pendientes" ? "btn-primario" : "btn-secundario"}`}
                onClick={() => setFiltro("pendientes")}
              >
                Pendientes
              </button>
              <button
                type="button"
                className={`btn btn-chico ${filtro === "hechas" ? "btn-primario" : "btn-secundario"}`}
                onClick={() => setFiltro("hechas")}
              >
                Hechas
              </button>
              <button
                type="button"
                className={`btn btn-chico ${filtro === "todas" ? "btn-primario" : "btn-secundario"}`}
                onClick={() => setFiltro("todas")}
              >
                Todas
              </button>
            </div>
          </div>

          {cargando && <p className="cargando">Cargando tareas...</p>}
          {error && <p className="error">{error}</p>}

          {!cargando && tareasFiltradas.length === 0 && (
            <p className="vacio">No hay tareas para mostrar.</p>
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
                    {nombreDe(tarea.responsable)} · vence{" "}
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
