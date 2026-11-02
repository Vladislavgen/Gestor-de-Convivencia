// Crea la cuenta demo, su hogar y carga los datos de ejemplo en Firestore.
// Se ejecuta una sola vez, con el contenedor levantado:
//   docker compose exec web node scripts/seed-demo.mjs
// (o con Node instalado: node --env-file=.env scripts/seed-demo.mjs)

import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  MIEMBROS_DEMO,
  generarGastosDemo,
  generarPagosDemo,
  generarTareasDemo,
} from "../src/utils/datosDemo.js";

const DEMO = {
  email: "demo@gestorconvivencia.com",
  password: "demo1234",
  nombre: "Ana",
  hogar: "Depto de Palermo",
};

const env = process.env;
if (!env.VITE_FIREBASE_API_KEY) {
  console.error("Faltan las variables VITE_FIREBASE_* (archivo .env)");
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

function generarCodigo() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return codigo;
}

// 1. Cuenta
let credencial;
try {
  credencial = await createUserWithEmailAndPassword(auth, DEMO.email, DEMO.password);
  await updateProfile(credencial.user, { displayName: DEMO.nombre });
  console.log("Cuenta demo creada:", DEMO.email);
} catch (err) {
  if (err.code === "auth/email-already-in-use") {
    credencial = await signInWithEmailAndPassword(auth, DEMO.email, DEMO.password);
    console.log("La cuenta demo ya existía, sesión iniciada");
  } else {
    throw err;
  }
}
const uid = credencial.user.uid;

// 2. Perfil y hogar
const perfilRef = doc(db, "usuarios", uid);
const perfil = await getDoc(perfilRef);
let hogarId = perfil.exists() ? perfil.data().hogarId : null;

if (!hogarId) {
  const hogarRef = await addDoc(collection(db, "hogares"), {
    nombre: DEMO.hogar,
    codigo: generarCodigo(),
    creadoPor: uid,
    miembros: [{ uid, nombre: DEMO.nombre }],
    creadoEn: serverTimestamp(),
  });
  hogarId = hogarRef.id;
  await setDoc(perfilRef, { nombre: DEMO.nombre, email: DEMO.email, hogarId }, { merge: true });
  console.log("Hogar creado:", DEMO.hogar);
} else {
  console.log("El hogar ya existía");
}

// 3. Datos de ejemplo (solo si el hogar está vacío)
const hogarRef = doc(db, "hogares", hogarId);
const gastosExistentes = await getDocs(collection(hogarRef, "gastos"));
if (!gastosExistentes.empty) {
  console.log("El hogar ya tiene gastos cargados, no se agregan datos de nuevo.");
  process.exit(0);
}

const batch = writeBatch(db);
batch.update(hogarRef, { miembros: arrayUnion(...MIEMBROS_DEMO) });

const comunes = { creadoPor: uid, creadoEn: serverTimestamp(), demo: true };
const gastos = generarGastosDemo(uid);
const pagos = generarPagosDemo(uid);
const tareas = generarTareasDemo(uid);

gastos.forEach((g) => batch.set(doc(collection(hogarRef, "gastos")), { ...g, ...comunes }));
pagos.forEach((p) => batch.set(doc(collection(hogarRef, "pagos")), { ...p, ...comunes }));
tareas.forEach((t) => batch.set(doc(collection(hogarRef, "tareas")), { ...t, ...comunes }));

await batch.commit();
console.log(`Listo: ${gastos.length} gastos, ${pagos.length} pagos, ${tareas.length} tareas.`);
console.log(`Entrar con ${DEMO.email} / ${DEMO.password}`);
process.exit(0);
