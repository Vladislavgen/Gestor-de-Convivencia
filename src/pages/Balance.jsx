import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useGastos } from "../hooks/useGastos";
import { calcularBalance } from "../utils/balance";
import { formatearMonto } from "../utils/formato";
import "./Balance.css";

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// "2026-10" -> "Octubre 2026"
function nombreMes(clave) {
  const [anio, mes] = clave.split("-");
  return `${NOMBRES_MESES[Number(mes) - 1]} ${anio}`;
}

function Balance() {
  const { usuario, hogar } = useAuth();
  const { gastos, cargando, error } = useGastos(hogar.id);
  const [mes, setMes] = useState("Todos");

  // Meses disponibles según los gastos cargados (fecha "YYYY-MM-DD")
  const meses = [...new Set(gastos.map((g) => g.fecha.slice(0, 7)))].sort().reverse();

  const gastosDelMes =
    mes === "Todos" ? gastos : gastos.filter((g) => g.fecha.startsWith(mes));

  const balance = calcularBalance(gastosDelMes, hogar.miembros);

  if (cargando) {
    return <p className="cargando">Calculando balance...</p>;
  }

  return (
    <div className="balance">
      <div className="balance-encabezado">
        <h1>Balance de {hogar.nombre}</h1>
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

      <div className="balance-resumen">
        <div className="card">
          <span className="balance-etiqueta">Total de gastos</span>
          <strong>{formatearMonto(balance.total)}</strong>
        </div>
        <div className="card">
          <span className="balance-etiqueta">Por persona</span>
          <strong>{formatearMonto(balance.corresponde)}</strong>
        </div>
        <div className="card">
          <span className="balance-etiqueta">Gastos cargados</span>
          <strong>{gastosDelMes.length}</strong>
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
                    {saldo.diferencia > 0 ? "+" : ""}
                    {formatearMonto(saldo.diferencia)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ayuda">
            Diferencia positiva: le deben. Negativa: debe.
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
            <ul className="balance-transferencias">
              {balance.transferencias.map((t, indice) => (
                <li key={indice}>
                  <strong>{t.de}</strong> le pasa{" "}
                  <strong>{formatearMonto(t.monto)}</strong> a{" "}
                  <strong>{t.a}</strong>
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
