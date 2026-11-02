import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGastos } from "../hooks/useGastos";
import { usePagos } from "../hooks/usePagos";
import { useTareas } from "../hooks/useTareas";
import { calcularBalance } from "../utils/balance";
import { claseCategoria, iconoCategoria } from "../utils/categorias";
import { formatearFecha, formatearMonto, hoy, nombreMes } from "../utils/formato";
import { resumirGastos } from "../services/gemini";
import { cargarDatosDemo } from "../services/demo";
import "./Inicio.css";

function Inicio() {
  const { usuario, hogar, nombreUsuario } = useAuth();
  const { gastos, cargando } = useGastos(hogar.id);
  const { pagos } = usePagos(hogar.id);
  const { tareas } = useTareas(hogar.id);

  const [resumen, setResumen] = useState("");
  const [generando, setGenerando] = useState(false);
  const [errorIA, setErrorIA] = useState("");
  const [cargandoDemo, setCargandoDemo] = useState(false);
  const [errorDemo, setErrorDemo] = useState("");

  const nombreDe = (uid) => {
    const miembro = hogar.miembros.find((m) => m.uid === uid);
    return miembro ? miembro.nombre : "Ex miembro";
  };

  // Datos del mes actual
  const mesActual = hoy().slice(0, 7);
  const gastosMes = gastos.filter((g) => g.fecha.startsWith(mesActual));
  const pagosMes = pagos.filter((p) => p.fecha.startsWith(mesActual));
  const balance = calcularBalance(gastosMes, pagosMes, hogar.miembros);
  const miSaldo = balance.saldos.find((s) => s.uid === usuario.uid);
  const diferencia = miSaldo ? miSaldo.diferencia : 0;

  const pendientes = tareas.filter((t) => !t.hecha);
  const vencidas = pendientes.filter((t) => t.fechaLimite < hoy());
  const misPendientes = pendientes.filter((t) => t.responsable === usuario.uid);

  const ultimosGastos = gastos.slice(0, 5);
  const proximasTareas = pendientes.slice(0, 5);

  let textoSaldo = "Estás al día";
  let claseSaldo = "";
  if (diferencia > 0.01) {
    textoSaldo = "Te deben";
    claseSaldo = "positivo";
  } else if (diferencia < -0.01) {
    textoSaldo = "Debés";
    claseSaldo = "negativo";
  }

  const generarResumen = async () => {
    setErrorIA("");
    setGenerando(true);
    try {
      const datos = gastosMes.map((g) => ({ ...g, pagador: nombreDe(g.pagadoPor) }));
      const texto = await resumirGastos(datos, nombreMes(mesActual));
      setResumen(texto);
    } catch (err) {
      console.error(err);
      setErrorIA("No se pudo generar el resumen. Probá de nuevo en un rato.");
    } finally {
      setGenerando(false);
    }
  };

  const cargarEjemplo = async () => {
    const confirmar = window.confirm(
      "Se van a agregar 4 miembros de ejemplo y tres meses de gastos, pagos y tareas. ¿Continuar?",
    );
    if (!confirmar) return;

    setErrorDemo("");
    setCargandoDemo(true);
    try {
      await cargarDatosDemo(hogar, usuario);
    } catch (err) {
      console.error(err);
      setErrorDemo("No se pudieron cargar los datos de ejemplo. Intentá de nuevo.");
    } finally {
      setCargandoDemo(false);
    }
  };

  if (cargando) {
    return <p className="cargando">Cargando...</p>;
  }

  const hogarVacio = gastos.length === 0 && tareas.length === 0;

  return (
    <div className="inicio">
      {hogarVacio && (
        <div className="card inicio-demo">
          <h2>¿Querés ver la app con datos?</h2>
          <p className="ayuda">
            Podés cargar un hogar de ejemplo: cinco personas que comparten un
            depto, con tres meses de gastos, pagos entre ellos y tareas. Después
            podés editar o borrar lo que quieras.
          </p>
          {errorDemo && <p className="error">{errorDemo}</p>}
          <div className="acciones">
            <button
              type="button"
              className="btn btn-primario"
              onClick={cargarEjemplo}
              disabled={cargandoDemo}
            >
              {cargandoDemo ? "Cargando..." : "Cargar datos de ejemplo"}
            </button>
          </div>
        </div>
      )}

      <div className="encabezado">
        <div>
          <h1>Hola, {nombreUsuario}</h1>
          <p>
            Así va {hogar.nombre} en {nombreMes(mesActual).toLowerCase()}.
          </p>
        </div>
        <Link to="/gastos" className="btn btn-primario">
          Cargar un gasto
        </Link>
      </div>

      <div className="resumen">
        <Link to="/gastos" className="card">
          <span className="resumen-etiqueta">Gastos del mes</span>
          <span className="resumen-valor">{formatearMonto(balance.total)}</span>
          <span className="resumen-detalle">
            {gastosMes.length} {gastosMes.length === 1 ? "gasto" : "gastos"},{" "}
            {formatearMonto(balance.corresponde)} por persona
          </span>
        </Link>

        <Link to="/balance" className="card">
          <span className="resumen-etiqueta">{textoSaldo}</span>
          <span className={`resumen-valor ${claseSaldo}`}>
            {formatearMonto(Math.abs(diferencia))}
          </span>
          <span className="resumen-detalle">
            {balance.transferencias.length === 0
              ? "No hay transferencias pendientes"
              : `${balance.transferencias.length} ${
                  balance.transferencias.length === 1
                    ? "transferencia pendiente"
                    : "transferencias pendientes"
                }`}
          </span>
        </Link>

        <Link to="/tareas" className="card">
          <span className="resumen-etiqueta">Tareas pendientes</span>
          <span className="resumen-valor">{pendientes.length}</span>
          <span className="resumen-detalle">
            {misPendientes.length} {misPendientes.length === 1 ? "tuya" : "tuyas"}
            {vencidas.length > 0 && `, ${vencidas.length} ${vencidas.length === 1 ? "vencida" : "vencidas"}`}
          </span>
        </Link>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Últimos gastos</h2>
          {ultimosGastos.length === 0 ? (
            <p className="vacio">
              Todavía no hay gastos. <Link to="/gastos">Cargá el primero</Link>.
            </p>
          ) : (
            <ul className="lista">
              {ultimosGastos.map((gasto) => (
                <li key={gasto.id}>
                  <span className={`icono-categoria ${claseCategoria(gasto.categoria)}`}>
                    {iconoCategoria(gasto.categoria)}
                  </span>
                  <div className="lista-info">
                    <strong>{gasto.concepto}</strong>
                    <span className="lista-detalle">
                      {formatearFecha(gasto.fecha)}, pagó {nombreDe(gasto.pagadoPor)}
                    </span>
                  </div>
                  <span className="inicio-monto">{formatearMonto(gasto.monto)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Próximas tareas</h2>
          {proximasTareas.length === 0 ? (
            <p className="vacio">
              No hay tareas pendientes. <Link to="/tareas">Agregá una</Link>.
            </p>
          ) : (
            <ul className="lista">
              {proximasTareas.map((tarea) => (
                <li key={tarea.id}>
                  <span className="avatar">
                    {nombreDe(tarea.responsable).charAt(0).toUpperCase()}
                  </span>
                  <div className="lista-info">
                    <strong>{tarea.titulo}</strong>
                    <span className="lista-detalle">
                      {nombreDe(tarea.responsable)}, vence {formatearFecha(tarea.fechaLimite)}
                    </span>
                  </div>
                  {tarea.fechaLimite < hoy() && (
                    <span className="badge badge-error">Vencida</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card inicio-ia">
        <div className="inicio-ia-encabezado">
          <div>
            <h2>Resumen del mes con IA</h2>
            <p className="ayuda">
              Gemini lee los gastos de {nombreMes(mesActual).toLowerCase()} y te
              cuenta en qué se fue la plata.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={generarResumen}
            disabled={generando || gastosMes.length === 0}
          >
            {generando ? "Generando..." : resumen ? "Generar de nuevo" : "Generar resumen"}
          </button>
        </div>

        {gastosMes.length === 0 && (
          <p className="ayuda">Cuando haya gastos cargados este mes, vas a poder pedir el resumen.</p>
        )}
        {errorIA && <p className="error">{errorIA}</p>}
        {resumen && <p className="inicio-resumen">{resumen}</p>}
      </div>
    </div>
  );
}

export default Inicio;
