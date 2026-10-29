// Traduce los códigos de error de Firebase Auth a mensajes en español
const mensajes = {
  "auth/invalid-email": "El correo no es válido",
  "auth/user-not-found": "No existe una cuenta con ese correo",
  "auth/wrong-password": "La contraseña es incorrecta",
  "auth/invalid-credential": "El correo o la contraseña son incorrectos",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo",
  "auth/weak-password": "La contraseña tiene que tener al menos 6 caracteres",
  "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de terminar",
  "auth/too-many-requests": "Demasiados intentos. Probá de nuevo más tarde",
  "auth/network-request-failed": "No hay conexión a internet",
};

export function traducirError(codigo) {
  return mensajes[codigo] || "Ocurrió un error. Intentá de nuevo";
}
