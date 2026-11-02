export const CATEGORIAS = [
  "Alquiler",
  "Servicios",
  "Comida",
  "Limpieza",
  "Transporte",
  "Salidas",
  "Otro",
];

const ICONOS = {
  Alquiler: "🏠",
  Servicios: "💡",
  Comida: "🛒",
  Limpieza: "🧹",
  Transporte: "🚌",
  Salidas: "🍕",
  Otro: "📦",
};

export function iconoCategoria(categoria) {
  return ICONOS[categoria] || ICONOS.Otro;
}

// Clase CSS para el color de fondo del ícono, por ejemplo "cat-comida"
export function claseCategoria(categoria) {
  const nombre = CATEGORIAS.includes(categoria) ? categoria : "Otro";
  return `cat-${nombre.toLowerCase()}`;
}
