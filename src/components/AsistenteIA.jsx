import { useState } from "react";
import { interpretarGasto } from "../services/gemini";
import { CATEGORIAS } from "../utils/categorias";
import { hoy } from "../utils/formato";
import "./AsistenteIA.css";

// Caja de texto donde el usuario escribe el gasto en lenguaje natural.
// Gemini devuelve un borrador y se lo pasamos al formulario con onBorrador.
function AsistenteIA({ miembros, uidActual, nombreUsuario, onBorrador }) {
  const [frase, setFrase] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const interpretar = async () => {
    if (!frase.trim()) {
      setError("Escribí una frase primero");
      return;
    }

    setError("");
    setCargando(true);
    try {
      const datos = await interpretarGasto(frase.trim(), miembros, nombreUsuario);

      // Buscamos el uid del miembro por el nombre que devolvió la IA
      const pagador = miembros.find((m) => m.nombre === datos.pagadoPor);

      onBorrador({
        concepto: datos.concepto || "",
        monto: datos.monto || "",
        categoria: CATEGORIAS.includes(datos.categoria) ? datos.categoria : "Otro",
        pagadoPor: pagador ? pagador.uid : uidActual,
        fecha: datos.fecha || hoy(),
      });
      setFrase("");
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo interpretar la frase. Podés cargar el gasto a mano con el formulario.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="asistente">
      <h2>Cargar con IA</h2>
      <p className="ayuda">
        Escribí el gasto como lo contarías y Gemini completa el formulario.
        Después revisás y confirmás.
      </p>

      <label htmlFor="frase">Frase</label>
      <textarea
        id="frase"
        value={frase}
        onChange={(e) => setFrase(e.target.value)}
        placeholder='Por ejemplo: "Pagué 12000 de supermercado el sábado"'
        disabled={cargando}
      />

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button
          type="button"
          className="btn btn-secundario"
          onClick={interpretar}
          disabled={cargando}
        >
          {cargando ? "Interpretando..." : "Interpretar con IA"}
        </button>
      </div>
    </div>
  );
}

export default AsistenteIA;
