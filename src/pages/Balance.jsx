import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useGastos } from "../hooks/useGastos";
import { usePagos } from "../hooks/usePagos";
import { calcularBalance, totalPorCategoria } from "../utils/balance";
import { claseCategoria, iconoCategoria } from "../utils/categorias";
import { formatearFecha, formatearMonto, hoy, nombreMes } from "../utils/formato";
import "./Balance.css";

function Balance() {
  const { usuario, hogar } = useAuth();
  const { gastos, cargando, error } = useGastos(hogar.id);
  const { pagos, error: errorPagos } = usePagos(hogar.id);

  const [mes, setMes] = useState("Todos");
  const [pagoDe, setPagoDe] = useState(usuario.uid);
  const [pagoA, setPagoA] = useState("");
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoFecha, setPagoFecha] = useState(hoy());
  const [errorForm, setErrorForm] = useState("");
  const [mensaje, setMensaje] = useState("");

  const coleccionPagos = collection(db, "hogares", hogar.id, "pagos");

  const nombreDe = (uid) => {
    const miembro = hogar.miembros.find((m) => m.uid === uid);
    return miembro ? miembro.nombre : "Ex miembro";
  };

  // Meses disponibles según los gastos cargados (fecha "YYYY-MM-DD")
  const meses = [...new Set(gastos.map((g) => g.fecha.slice(0, 7)))].sort().reverse();

  const delMes = (lista) =>
    mes === "Todos" ? lista : lista.filter((item) => item.fecha.startsWith(mes));

  const gastosDelMes = delMes(gastos);
  const pagosDelMes = delMes(pagos);

  const balance = calcularBalance(gastosDelMes, pagosDelMes, hogar.miembros);
  const porCategoria = totalPorCategoria(gastosDelMes);
  const mayorCategoria = porCategoria.length > 0 ? porCategoria[0].total : 0;

  const guardarPago = async (datos) => {
    setErrorForm("");
    setMensaje("");
    try {
      await addDoc(coleccionPagos, {
        ...datos,
        creadoPor: usuario.uid,
        creadoEn: serverTimestamp(),
      });
      setMensaje(
        `Pago registrado: ${nombreDe(datos.de)} le pasó ${formatearMonto(datos.monto)} a ${nombreDe(datos.a)}`,
      );
      return true;
    } catch (err) {
      console.error(err);
      setErrorForm("No se pudo registrar el pago. Intentá de nuevo");
      return false;
    }
  };

  const registrarPagoManual = async (e) => {
    e.preventDefault();

    if (!pagoA) {
      setErrorForm("Elegí quién recibe el pago");
      return;
    }
    if (pagoDe === pagoA) {
      setErrorForm("El que paga y el que recibe tienen que ser distintos");
      return;
    }
    if (!pagoMonto || Number(pagoMonto) <= 0) {
      setErrorForm("El monto tiene que ser mayor a 0");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pagoFecha)) {
      setErrorForm("Elegí una fecha válida");
      return;
    }

    const guardado = await guardarPago({
      de: pagoDe,
      a: pagoA,
      monto: Number(pagoMonto),
      fecha: pagoFecha,
    });

    if (guardado) {
      setPagoMonto("");
      setPagoA("");
    }
  };

  // Botón "Registrar" al lado de cada transferencia sugerida
  const registrarTransferencia = async (transferencia) => {
    const confirmar = window.confirm(
      `¿Registrar que ${transferencia.de} le pasó ${formatearMonto(transferencia.monto)} a ${transferencia.a}?`,
    );
    if (!confirmar) return;

    await guardarPago({
      de: transferencia.deUid,
      a: transferencia.aUid,
      monto: transferencia.monto,
      fecha: hoy(),
    });
  };

  const eliminarPago = async (pago) => {
    const confirmar = window.confirm("¿Eliminar este pago?");
    if (!confirmar) return;

    try {
      await deleteDoc(doc(coleccionPagos, pago.id));
    } catch (err) {
      console.error(err);
      setErrorForm("No se pudo eliminar el pago");
    }
  };

  if (cargando) {
    return <p className="cargando">Calculando balance...</p>;
  }

  return (
    <div className="balance">
      <div className="encabezado">
        <div>
          <h1>Balance de {hogar.nombre}</h1>
          <p>Los gastos se dividen en partes iguales entre los miembros.</p>
        </div>
        <div>
          <label htmlFor="mes">Período</label>
          <select id="mes" value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="Todos">Todos los meses</option>
            {meses.map((clave) => (
              <option key={clave} value={clave}>
                {nombreMes(clave)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {errorPagos && <p className="error">{errorPagos}</p>}

      <div className="resumen">
        <div className="card">
          <span className="resumen-etiqueta">Total de gastos</span>
          <span className="resumen-valor">{formatearMonto(balance.total)}</span>
        </div>
        <div className="card">
          <span className="resumen-etiqueta">Le corresponde a cada uno</span>
          <span className="resumen-valor">{formatearMonto(balance.corresponde)}</span>
        </div>
        <div className="card">
          <span className="resumen-etiqueta">Gastos cargados</span>
          <span className="resumen-valor">{gastosDelMes.length}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Saldo por miembro</h2>
          <table>
            <thead>
              <tr>
                <th>Miembro</th>
                <th className="numero">Pagó</th>
                <th className="numero">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {balance.saldos.map((saldo) => (
                <tr key={saldo.uid}>
                  <td>
                    {saldo.nombre}
                    {saldo.uid === usuario.uid && (
                      <span className="badge badge-ok">vos</span>
                    )}
                  </td>
                  <td className="numero">{formatearMonto(saldo.pago)}</td>
                  <td
                    className={`numero ${
                      saldo.diferencia > 0.01
                        ? "positivo"
                        : saldo.diferencia < -0.01
                          ? "negativo"
                          : ""
                    }`}
                  >
                    {saldo.diferencia > 0.01 ? "+" : ""}
                    {formatearMonto(saldo.diferencia)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ayuda">
            Diferencia positiva: le deben. Negativa: debe. Los pagos entre
            miembros ya están descontados.
          </p>
        </div>

        <div className="card">
          <h2>Cómo saldar las cuentas</h2>
          {balance.transferencias.length === 0 ? (
            <p className="vacio">
              {gastosDelMes.length === 0
                ? "No hay gastos en este período."
                : "Están todos a mano, no hace falta transferir nada."}
            </p>
          ) : (
            <ul className="lista">
              {balance.transferencias.map((t, indice) => (
                <li key={indice}>
                  <div className="lista-info">
                    <span>
                      <strong>{t.de}</strong> le pasa{" "}
                      <strong>{formatearMonto(t.monto)}</strong> a{" "}
                      <strong>{t.a}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-chico btn-secundario"
                    onClick={() => registrarTransferencia(t)}
                  >
                    Ya se pagó
                  </button>
                </li>
              ))}
            </ul>
          )}
          {mensaje && <p className="mensaje-ok">{mensaje}</p>}
        </div>

        <div className="card">
          <h2>Gastos por categoría</h2>
          {porCategoria.length === 0 ? (
            <p className="vacio">No hay gastos en este período.</p>
          ) : (
            <ul className="categorias">
              {porCategoria.map((item) => (
                <li key={item.categoria}>
                  <span className={`icono-categoria ${claseCategoria(item.categoria)}`}>
                    {iconoCategoria(item.categoria)}
                  </span>
                  <div className="categoria-info">
                    <div className="categoria-fila">
                      <span>{item.categoria}</span>
                      <span className="categoria-monto">
                        {formatearMonto(item.total)}
                        <span className="categoria-porcentaje">
                          {" "}
                          {Math.round((item.total / balance.total) * 100)}%
                        </span>
                      </span>
                    </div>
                    <div className="barra">
                      <div
                        className="barra-relleno"
                        style={{ width: `${(item.total / mayorCategoria) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Pagos entre miembros</h2>
          <p className="ayuda">
            Cuando alguien le transfiere plata a otro, registralo acá para que
            el balance quede al día.
          </p>

          <form onSubmit={registrarPagoManual} noValidate>
            <div className="fila">
              <div>
                <label htmlFor="pagoDe">Pagó</label>
                <select
                  id="pagoDe"
                  value={pagoDe}
                  onChange={(e) => setPagoDe(e.target.value)}
                >
                  {hogar.miembros.map((miembro) => (
                    <option key={miembro.uid} value={miembro.uid}>
                      {miembro.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pagoA">Recibió</label>
                <select
                  id="pagoA"
                  value={pagoA}
                  onChange={(e) => setPagoA(e.target.value)}
                >
                  <option value="">Elegir...</option>
                  {hogar.miembros
                    .filter((miembro) => miembro.uid !== pagoDe)
                    .map((miembro) => (
                      <option key={miembro.uid} value={miembro.uid}>
                        {miembro.nombre}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="fila">
              <div>
                <label htmlFor="pagoMonto">Monto</label>
                <input
                  id="pagoMonto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pagoMonto}
                  onChange={(e) => setPagoMonto(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="pagoFecha">Fecha</label>
                <input
                  id="pagoFecha"
                  type="date"
                  value={pagoFecha}
                  onChange={(e) => setPagoFecha(e.target.value)}
                />
              </div>
            </div>

            {errorForm && <p className="error">{errorForm}</p>}

            <div className="acciones">
              <button type="submit" className="btn btn-primario">
                Registrar pago
              </button>
            </div>
          </form>

          {pagosDelMes.length > 0 && (
            <ul className="lista pagos-lista">
              {pagosDelMes.map((pago) => (
                <li key={pago.id}>
                  <div className="lista-info">
                    <span>
                      <strong>{nombreDe(pago.de)}</strong> le pasó{" "}
                      <strong>{formatearMonto(pago.monto)}</strong> a{" "}
                      <strong>{nombreDe(pago.a)}</strong>
                    </span>
                    <span className="lista-detalle">{formatearFecha(pago.fecha)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-chico btn-peligro"
                    onClick={() => eliminarPago(pago)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Balance;
