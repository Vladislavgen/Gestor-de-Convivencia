import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import "./Hogar.css";

// Genera un código de 6 letras/números, por ejemplo "K3PX7M"
function generarCodigo() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return codigo;
}

function Hogar() {
  const { usuario, perfil, hogar, nombreUsuario } = useAuth();
  const navigate = useNavigate();

  const [nombreHogar, setNombreHogar] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const crearHogar = async (e) => {
    e.preventDefault();
    if (!nombreHogar.trim()) {
      setError("Ponele un nombre al hogar");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const nuevoHogar = await addDoc(collection(db, "hogares"), {
        nombre: nombreHogar.trim(),
        codigo: generarCodigo(),
        creadoPor: usuario.uid,
        miembros: [{ uid: usuario.uid, nombre: nombreUsuario }],
        creadoEn: serverTimestamp(),
      });
      await setDoc(
        doc(db, "usuarios", usuario.uid),
        { hogarId: nuevoHogar.id },
        { merge: true },
      );
      navigate("/gastos");
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el hogar. Intentá de nuevo");
    } finally {
      setEnviando(false);
    }
  };

  const unirseAHogar = async (e) => {
    e.preventDefault();
    const codigoLimpio = codigo.trim().toUpperCase();
    if (codigoLimpio.length !== 6) {
      setError("El código tiene 6 caracteres");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const consulta = query(
        collection(db, "hogares"),
        where("codigo", "==", codigoLimpio),
      );
      const resultado = await getDocs(consulta);

      if (resultado.empty) {
        setError("No existe un hogar con ese código");
        return;
      }

      const hogarEncontrado = resultado.docs[0];
      await updateDoc(hogarEncontrado.ref, {
        miembros: arrayUnion({ uid: usuario.uid, nombre: nombreUsuario }),
      });
      await setDoc(
        doc(db, "usuarios", usuario.uid),
        { hogarId: hogarEncontrado.id },
        { merge: true },
      );
      navigate("/gastos");
    } catch (err) {
      console.error(err);
      setError("No se pudo unir al hogar. Intentá de nuevo");
    } finally {
      setEnviando(false);
    }
  };

  const salirDelHogar = async () => {
    const confirmar = window.confirm(
      "¿Seguro que querés salir del hogar? Tus gastos cargados van a quedar en el historial.",
    );
    if (!confirmar) return;

    try {
      const miembro = hogar.miembros.find((m) => m.uid === usuario.uid);
      await updateDoc(doc(db, "hogares", hogar.id), {
        miembros: arrayRemove(miembro),
      });
      await updateDoc(doc(db, "usuarios", usuario.uid), { hogarId: null });
    } catch (err) {
      console.error(err);
      setError("No se pudo salir del hogar");
    }
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(hogar.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador no deja copiar, el código igual queda visible en pantalla
    }
  };

  // El usuario ya tiene hogar pero todavía no terminó de cargar
  if (perfil?.hogarId && !hogar) {
    return <p className="cargando">Cargando...</p>;
  }

  // Vista del hogar actual
  if (hogar) {
    return (
      <div className="hogar">
        <h1>{hogar.nombre}</h1>

        <div className="grid-2">
          <div className="card">
            <h2>Código de invitación</h2>
            <p className="ayuda">
              Compartí este código con las personas que viven con vos para que
              se unan al hogar.
            </p>
            <div className="hogar-codigo">
              <span>{hogar.codigo}</span>
              <button
                type="button"
                className="btn btn-chico btn-secundario"
                onClick={copiarCodigo}
              >
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Miembros ({hogar.miembros.length})</h2>
            <ul className="hogar-miembros">
              {hogar.miembros.map((miembro) => (
                <li key={miembro.uid}>
                  <span className="avatar">
                    {miembro.nombre.charAt(0).toUpperCase()}
                  </span>
                  {miembro.nombre}
                  {miembro.uid === hogar.creadoPor && (
                    <span className="badge">creó el hogar</span>
                  )}
                  {miembro.uid === usuario.uid && (
                    <span className="badge badge-ok">vos</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="acciones">
          <button type="button" className="btn btn-peligro" onClick={salirDelHogar}>
            Salir del hogar
          </button>
        </div>
      </div>
    );
  }

  // El usuario todavía no tiene hogar
  return (
    <div className="hogar">
      <h1>Hola, {nombreUsuario}</h1>
      <p className="ayuda hogar-intro">
        Para empezar, creá un hogar nuevo o unite a uno existente con el código
        que te pasaron.
      </p>

      <div className="grid-2">
        <form className="card" onSubmit={crearHogar}>
          <h2>Crear un hogar</h2>
          <label htmlFor="nombreHogar">Nombre del hogar</label>
          <input
            id="nombreHogar"
            type="text"
            value={nombreHogar}
            onChange={(e) => setNombreHogar(e.target.value)}
            placeholder="Depto de Corrientes 1234"
          />
          <div className="acciones">
            <button type="submit" className="btn btn-primario" disabled={enviando}>
              Crear hogar
            </button>
          </div>
        </form>

        <form className="card" onSubmit={unirseAHogar}>
          <h2>Unirme con un código</h2>
          <label htmlFor="codigo">Código de invitación</label>
          <input
            id="codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="K3PX7M"
            maxLength={6}
          />
          <div className="acciones">
            <button
              type="submit"
              className="btn btn-secundario"
              disabled={enviando}
            >
              Unirme
            </button>
          </div>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Hogar;
