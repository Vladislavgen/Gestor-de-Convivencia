import { useState } from "react";
import { CATEGORIAS } from "../utils/categorias";
import { hoy } from "../utils/formato";

const formularioVacio = (uidActual) => ({
  concepto: "",
  monto: "",
  fecha: hoy(),
  categoria: "Comida",
  pagadoPor: uidActual,
});

// Formulario para crear o editar un gasto.
// Si llega "valoresIniciales" (edición o borrador de la IA) se completan los campos.
// El padre cambia la prop "key" cuando cambian los valores iniciales, así el
// formulario se reinicia solo.
function GastoForm({ miembros, uidActual, valoresIniciales, onGuardar, onCancelar }) {
  const [campos, setCampos] = useState(() =>
    valoresIniciales
      ? {
          concepto: valoresIniciales.concepto || "",
          monto: valoresIniciales.monto ?? "",
          fecha: valoresIniciales.fecha || hoy(),
          categoria: valoresIniciales.categoria || "Otro",
          pagadoPor: valoresIniciales.pagadoPor || uidActual,
        }
      : formularioVacio(uidActual),
  );
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampos({ ...campos, [name]: value });
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!campos.concepto.trim()) {
      nuevosErrores.concepto = "Escribí qué se compró o pagó";
    }
    if (!campos.monto || Number(campos.monto) <= 0) {
      nuevosErrores.monto = "El monto tiene que ser mayor a 0";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(campos.fecha)) {
      nuevosErrores.fecha = "Elegí una fecha válida";
    }
    if (!campos.pagadoPor) {
      nuevosErrores.pagadoPor = "Elegí quién pagó";
    }
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setGuardando(true);
    const guardado = await onGuardar({
      concepto: campos.concepto.trim(),
      monto: Number(campos.monto),
      fecha: campos.fecha,
      categoria: campos.categoria,
      pagadoPor: campos.pagadoPor,
    });
    setGuardando(false);

    // Solo limpiamos el formulario si se guardó bien
    if (guardado) {
      setCampos(formularioVacio(uidActual));
    }
  };

  const editando = Boolean(valoresIniciales?.id);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="concepto">Concepto</label>
      <input
        id="concepto"
        name="concepto"
        type="text"
        value={campos.concepto}
        onChange={handleChange}
        placeholder="Supermercado, luz, internet..."
      />
      {errores.concepto && <p className="error">{errores.concepto}</p>}

      <div className="fila">
        <div>
          <label htmlFor="monto">Monto</label>
          <input
            id="monto"
            name="monto"
            type="number"
            min="0"
            step="0.01"
            value={campos.monto}
            onChange={handleChange}
            placeholder="0.00"
          />
          {errores.monto && <p className="error">{errores.monto}</p>}
        </div>
        <div>
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            value={campos.fecha}
            onChange={handleChange}
          />
          {errores.fecha && <p className="error">{errores.fecha}</p>}
        </div>
      </div>

      <div className="fila">
        <div>
          <label htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            name="categoria"
            value={campos.categoria}
            onChange={handleChange}
          >
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pagadoPor">Pagó</label>
          <select
            id="pagadoPor"
            name="pagadoPor"
            value={campos.pagadoPor}
            onChange={handleChange}
          >
            {miembros.map((miembro) => (
              <option key={miembro.uid} value={miembro.uid}>
                {miembro.nombre}
              </option>
            ))}
          </select>
          {errores.pagadoPor && <p className="error">{errores.pagadoPor}</p>}
        </div>
      </div>

      <div className="acciones">
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Agregar gasto"}
        </button>
        {valoresIniciales && (
          <button type="button" className="btn btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default GastoForm;
