import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

// Escucha en tiempo real las tareas del hogar, ordenadas por fecha límite
export function useTareas(hogarId) {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hogarId) return;

    const consulta = query(
      collection(db, "hogares", hogarId, "tareas"),
      orderBy("fechaLimite"),
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        setTareas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar las tareas");
        setCargando(false);
      },
    );

    return unsubscribe;
  }, [hogarId]);

  return { tareas, cargando, error };
}
