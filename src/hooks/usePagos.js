import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

// Escucha en tiempo real los pagos entre miembros del hogar (los más nuevos primero)
export function usePagos(hogarId) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hogarId) return;

    const consulta = query(
      collection(db, "hogares", hogarId, "pagos"),
      orderBy("fecha", "desc"),
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        setPagos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar los pagos");
        setCargando(false);
      },
    );

    return unsubscribe;
  }, [hogarId]);

  return { pagos, cargando, error };
}
