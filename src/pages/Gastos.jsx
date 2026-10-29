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
import { useGastos } from "../hooks/useGastos";
import GastoForm from "../components/GastoForm";
import GastoItem from "../components/GastoItem";
import AsistenteIA from "../components/AsistenteIA";
import { CATEGORIAS } from "../utils/categorias";
import { formatearMonto } from "../utils/formato";
import "./Gastos.css";

function Gastos() {
  const { usuario, hogar, nombreUsuario } = useAuth();
  const { gastos, cargando, error } = useGastos(hogar.id);

  const [gastoEditando, setGastoEditando] = useState(null);
  const [borradorIA, setBorradorIA] = useState(null);
  const [contadorBorradores, setContadorBorradores] = useState(0);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroMiembro, setFiltroMiembro] = useState("Todos");
  const [errorGuardar, setErrorGuardar] = useState("");

  const coleccionGastos = collection(db, "hogares", hogar.id, "gastos");

  const nombreDe = (uid) => {
    const miembro = hogar.miembros.find((m) => m.uid === uid);
    return miembro ? miembro.nombre : "Ex miembro";
  };

  const guardarGasto = async (datos) => {
    setErrorGuardar("");
    try {
      if (gastoEditando) {
        await updateDoc(doc(coleccionGastos, gastoEditando.id), datos);
      } else {
        await addDoc(coleccionGastos, {
          ...datos,
          creadoPor: usuario.uid,
          creadoEn: serverTimestamp(),
        });
      }
      setGastoEditando(null);
      setBorradorIA(null);
      return true;
    } catch (err) {
      console.error(err);
      setErrorGuardar("No se pudo guardar el gasto. Intentá de nuevo");
      return false;
    }
  };

  const eliminarGasto = async (gasto) => {
    const confirmar = window.confirm(`¿Eliminar "${gasto.concepto}"?`);
    if (!confirmar) return;

    try {
      await deleteDoc(doc(coleccionGastos, gasto.id));
      if (gastoEditando?.id === gasto.id) {
        setGastoEditando(null);
      }
    } catch (err) {
      console.error(err);
      setErrorGuardar("No se pudo eliminar el gasto");
    }
  };

  const empezarEdicion = (gasto) => {
    setBorradorIA(null);
    setGastoEditando(gasto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setGastoEditando(null);
    setBorradorIA(null);
  };

  const recibirBorrador = (borrador) => {
    setGastoEditando(null);
    setBorradorIA(borrador);
    setContadorBorradores(contadorBorradores + 1);
  };

  // Cambiar la key reinicia el formulario con los nuevos valores iniciales
  let claveFormulario = "nuevo";
  if (gastoEditando) {
    claveFormulario = `editar-${gastoEditando.id}`;
  } else if (borradorIA) {
    claveFormulario = `borrador-${contadorBorradores}`;
  }

  // Filtros en memoria sobre la lista que viene de Firestore
  const gastosFiltrados = gastos.filter((gasto) => {
    const coincideCategoria =
      filtroCategoria === "Todas" || gasto.categoria === filtroCategoria;
    const coincideMiembro =
      filtroMiembro === "Todos" || gasto.pagadoPor === filtroMiembro;
    return coincideCategoria && coincideMiembro;
  });

  const totalFiltrado = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);

  return (
    <div className="gastos">
      <h1>Gastos de {hogar.nombre}</h1>

      <div className="grid-2">
        <div className="card">
          <AsistenteIA
            miembros={hogar.miembros}
            uidActual={usuario.uid}
            nombreUsuario={nombreUsuario}
            onBorrador={recibirBorrador}
          />

          <h2>{gastoEditando ? "Editar gasto" : "Nuevo gasto"}</h2>
          {borradorIA && (
            <p className="mensaje-ok">
              La IA completó el formulario. Revisá los datos y confirmá.
            </p>
          )}
          <GastoForm
            key={claveFormulario}
            miembros={hogar.miembros}
            uidActual={usuario.uid}
            valoresIniciales={gastoEditando || borradorIA}
            onGuardar={guardarGasto}
            onCancelar={cancelarEdicion}
          />
          {errorGuardar && <p className="error">{errorGuardar}</p>}
        </div>

        <div className="card">
          <h2>Historial</h2>

          <div className="filtros">
            <div>
              <label htmlFor="filtroCategoria">Categoría</label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="Todas">Todas</option>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filtroMiembro">Pagó</label>
              <select
                id="filtroMiembro"
                value={filtroMiembro}
                onChange={(e) => setFiltroMiembro(e.target.value)}
              >
                <option value="Todos">Todos</option>
                {hogar.miembros.map((miembro) => (
                  <option key={miembro.uid} value={miembro.uid}>
                    {miembro.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargando && <p className="cargando">Cargando gastos...</p>}
          {error && <p className="error">{error}</p>}

          {!cargando && gastosFiltrados.length === 0 && (
            <p className="vacio">
              {gastos.length === 0
                ? "Todavía no hay gastos cargados."
                : "No hay gastos con esos filtros."}
            </p>
          )}

          {gastosFiltrados.length > 0 && (
            <>
              <ul className="gasto-lista">
                {gastosFiltrados.map((gasto) => (
                  <GastoItem
                    key={gasto.id}
                    gasto={gasto}
                    nombrePagador={nombreDe(gasto.pagadoPor)}
                    onEditar={empezarEdicion}
                    onEliminar={eliminarGasto}
                  />
                ))}
              </ul>
              <p className="gasto-total">
                {gastosFiltrados.length}{" "}
                {gastosFiltrados.length === 1 ? "gasto" : "gastos"} · Total:{" "}
                <strong>{formatearMonto(totalFiltrado)}</strong>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gastos;
