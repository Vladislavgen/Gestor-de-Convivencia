import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

// Escucha en tiempo real los gastos del hogar (los más nuevos primero)
export function useGastos(hogarId) {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hogarId) return;

    const consulta = query(
      collection(db, "hogares", hogarId, "gastos"),
      orderBy("fecha", "desc"),
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGastos(lista);
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar los gastos");
        setCargando(false);
      },
    );

    return unsubscribe;
  }, [hogarId]);

  return { gastos, cargando, error };
}
