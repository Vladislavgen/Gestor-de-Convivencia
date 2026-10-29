import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // usuario de Firebase Auth
  const [perfil, setPerfil] = useState(null); // documento de la colección "usuarios"
  const [hogar, setHogar] = useState(null); // documento de la colección "hogares"
  const [cargando, setCargando] = useState(true);

  // Escucha los cambios de sesión (login / logout / recarga de página)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (user) {
        setCargando(true);
      } else {
        setPerfil(null);
        setHogar(null);
        setCargando(false);
      }
    });
    return unsubscribe;
  }, []);

  // Cuando hay usuario, escucha su perfil en Firestore
  useEffect(() => {
    if (!usuario) return;

    const unsubscribe = onSnapshot(
      doc(db, "usuarios", usuario.uid),
      (snap) => {
        setPerfil(snap.exists() ? snap.data() : null);
        setCargando(false);
      },
      (err) => {
        console.error("No se pudo leer el perfil", err);
        setCargando(false);
      },
    );
    return unsubscribe;
  }, [usuario]);

  // Cuando el perfil tiene un hogar, escucha ese hogar
  const hogarId = perfil?.hogarId;
  useEffect(() => {
    if (!hogarId) return;

    const unsubscribe = onSnapshot(doc(db, "hogares", hogarId), (snap) => {
      setHogar(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });

    // Al cambiar de hogar (o salir de uno) dejamos de escuchar y limpiamos
    return () => {
      unsubscribe();
      setHogar(null);
    };
  }, [hogarId]);

  const nombreUsuario =
    perfil?.nombre || usuario?.displayName || usuario?.email || "";

  return (
    <AuthContext.Provider
      value={{ usuario, perfil, hogar, cargando, nombreUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
