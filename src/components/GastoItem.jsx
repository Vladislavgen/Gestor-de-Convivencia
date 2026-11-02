import { claseCategoria, iconoCategoria } from "../utils/categorias";
import { formatearFecha, formatearMonto } from "../utils/formato";

function GastoItem({ gasto, nombrePagador, onEditar, onEliminar }) {
  return (
    <li className="gasto-item">
      <span className={`icono-categoria ${claseCategoria(gasto.categoria)}`}>
        {iconoCategoria(gasto.categoria)}
      </span>

      <div className="gasto-info">
        <strong>{gasto.concepto}</strong>
        <span className="gasto-detalle">
          {formatearFecha(gasto.fecha)} · pagó {nombrePagador} ·{" "}
          {gasto.categoria}
        </span>
      </div>

      <div className="gasto-monto">{formatearMonto(gasto.monto)}</div>

      <div className="gasto-acciones">
        <button
          type="button"
          className="btn btn-chico btn-secundario"
          onClick={() => onEditar(gasto)}
        >
          Editar
        </button>
        <button
          type="button"
          className="btn btn-chico btn-peligro"
          onClick={() => onEliminar(gasto)}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}

export default GastoItem;
