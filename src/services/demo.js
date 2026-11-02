import {
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  MIEMBROS_DEMO,
  generarGastosDemo,
  generarPagosDemo,
  generarTareasDemo,
} from "../utils/datosDemo";

// Carga en el hogar los miembros, gastos, pagos y tareas de ejemplo.
// Se usa un batch para que se guarde todo junto en una sola operación.
export async function cargarDatosDemo(hogar, usuario) {
  const batch = writeBatch(db);
  const hogarRef = doc(db, "hogares", hogar.id);

  // Agregamos los miembros de ejemplo que todavía no estén en el hogar
  const uidsActuales = hogar.miembros.map((m) => m.uid);
  const nuevosMiembros = MIEMBROS_DEMO.filter((m) => !uidsActuales.includes(m.uid));
  if (nuevosMiembros.length > 0) {
    batch.update(hogarRef, { miembros: arrayUnion(...nuevosMiembros) });
  }

  const comunes = { creadoPor: usuario.uid, creadoEn: serverTimestamp(), demo: true };

  generarGastosDemo(usuario.uid).forEach((gasto) => {
    batch.set(doc(collection(hogarRef, "gastos")), { ...gasto, ...comunes });
  });

  generarPagosDemo(usuario.uid).forEach((pago) => {
    batch.set(doc(collection(hogarRef, "pagos")), { ...pago, ...comunes });
  });

  generarTareasDemo(usuario.uid).forEach((tarea) => {
    batch.set(doc(collection(hogarRef, "tareas")), { ...tarea, ...comunes });
  });

  await batch.commit();
}
