// Datos de ejemplo para probar la aplicación sin cargar todo a mano.
// El hogar demo son cinco personas que comparten un depto:
// dos parejas (Ana y Bruno, Carolina y Diego) y Ezequiel, que vive solo en su pieza.
// El usuario que carga los datos ocupa el lugar de Ana.
// Hay tres meses de movimientos para que el balance y el historial tengan historia.

export const MIEMBROS_DEMO = [
  { uid: "demo-bruno", nombre: "Bruno" },
  { uid: "demo-carolina", nombre: "Carolina" },
  { uid: "demo-diego", nombre: "Diego" },
  { uid: "demo-ezequiel", nombre: "Ezequiel" },
];

function formatear(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Devuelve la fecha de hace N días (N negativo: dentro de N días)
function hace(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return formatear(fecha);
}

// Devuelve el día "dia" del mes de hace "mesesAtras" meses (0 = este mes)
function enMes(mesesAtras, dia) {
  const hoy = new Date();
  return formatear(new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, dia));
}

// Un movimiento de este mes solo se incluye si su día ya pasó
function yaPaso(movimiento) {
  return movimiento.fecha <= hace(0);
}

// "yo" es el uid del usuario que carga los datos (Ana)
export function generarGastosDemo(yo) {
  const gastos = [
    // Hace dos meses (día del mes entre paréntesis)
    { fecha: enMes(2, 1), concepto: "Alquiler", categoria: "Alquiler", monto: 820000, pagadoPor: "demo-bruno" },
    { fecha: enMes(2, 1), concepto: "Expensas", categoria: "Alquiler", monto: 115000, pagadoPor: yo },
    { fecha: enMes(2, 3), concepto: "Supermercado Coto", categoria: "Comida", monto: 55800, pagadoPor: yo },
    { fecha: enMes(2, 5), concepto: "Luz Edesur", categoria: "Servicios", monto: 41500, pagadoPor: "demo-diego" },
    { fecha: enMes(2, 6), concepto: "Internet Fibertel", categoria: "Servicios", monto: 21900, pagadoPor: "demo-ezequiel" },
    { fecha: enMes(2, 8), concepto: "Gas Metrogas", categoria: "Servicios", monto: 22400, pagadoPor: "demo-carolina" },
    { fecha: enMes(2, 10), concepto: "Verdulería", categoria: "Comida", monto: 15300, pagadoPor: "demo-carolina" },
    { fecha: enMes(2, 12), concepto: "Empanadas para todos", categoria: "Salidas", monto: 28000, pagadoPor: "demo-diego" },
    { fecha: enMes(2, 14), concepto: "Lavandina y trapos", categoria: "Limpieza", monto: 9900, pagadoPor: "demo-ezequiel" },
    { fecha: enMes(2, 17), concepto: "Supermercado Día", categoria: "Comida", monto: 43600, pagadoPor: "demo-bruno" },
    { fecha: enMes(2, 20), concepto: "Taxi al aeropuerto (Caro y Diego)", categoria: "Transporte", monto: 18500, pagadoPor: "demo-carolina" },

    // Mes pasado
    { fecha: enMes(1, 1), concepto: "Alquiler", categoria: "Alquiler", monto: 850000, pagadoPor: "demo-bruno" },
    { fecha: enMes(1, 1), concepto: "Expensas", categoria: "Alquiler", monto: 120000, pagadoPor: yo },
    { fecha: enMes(1, 3), concepto: "Supermercado Coto", categoria: "Comida", monto: 62400, pagadoPor: yo },
    { fecha: enMes(1, 4), concepto: "Luz Edesur", categoria: "Servicios", monto: 38200, pagadoPor: "demo-diego" },
    { fecha: enMes(1, 6), concepto: "Internet Fibertel", categoria: "Servicios", monto: 21900, pagadoPor: "demo-ezequiel" },
    { fecha: enMes(1, 7), concepto: "Gas Metrogas", categoria: "Servicios", monto: 15500, pagadoPor: "demo-carolina" },
    { fecha: enMes(1, 9), concepto: "Verdulería", categoria: "Comida", monto: 18700, pagadoPor: "demo-carolina" },
    { fecha: enMes(1, 11), concepto: "Pizzas del viernes", categoria: "Salidas", monto: 34000, pagadoPor: "demo-ezequiel" },
    { fecha: enMes(1, 13), concepto: "Artículos de limpieza", categoria: "Limpieza", monto: 14800, pagadoPor: "demo-diego" },
    { fecha: enMes(1, 15), concepto: "Supermercado Día", categoria: "Comida", monto: 47300, pagadoPor: "demo-bruno" },
    { fecha: enMes(1, 18), concepto: "Uber de vuelta del cumple", categoria: "Transporte", monto: 9800, pagadoPor: "demo-bruno" },
    { fecha: enMes(1, 21), concepto: "Lamparitas y alargue", categoria: "Otro", monto: 11200, pagadoPor: yo },

    // Este mes
    { fecha: enMes(0, 1), concepto: "Alquiler", categoria: "Alquiler", monto: 850000, pagadoPor: "demo-bruno" },
    { fecha: enMes(0, 1), concepto: "Expensas", categoria: "Alquiler", monto: 125000, pagadoPor: yo },
    { fecha: enMes(0, 2), concepto: "Supermercado Carrefour", categoria: "Comida", monto: 58900, pagadoPor: "demo-carolina" },
    { fecha: enMes(0, 4), concepto: "Agua AySA", categoria: "Servicios", monto: 9900, pagadoPor: "demo-diego" },
    { fecha: enMes(0, 6), concepto: "Asado del domingo", categoria: "Salidas", monto: 64000, pagadoPor: "demo-ezequiel" },
    { fecha: enMes(0, 8), concepto: "Netflix y Spotify", categoria: "Servicios", monto: 12900, pagadoPor: yo },
    { fecha: enMes(0, 10), concepto: "Verdulería", categoria: "Comida", monto: 16400, pagadoPor: yo },
    { fecha: enMes(0, 12), concepto: "Detergente y esponjas", categoria: "Limpieza", monto: 7600, pagadoPor: "demo-carolina" },
    { fecha: enMes(0, 14), concepto: "Carbón para el asado", categoria: "Salidas", monto: 8500, pagadoPor: "demo-diego" },
    { fecha: enMes(0, 16), concepto: "Supermercado Coto", categoria: "Comida", monto: 71200, pagadoPor: "demo-bruno" },
  ];
  return gastos.filter(yaPaso);
}

export function generarPagosDemo(yo) {
  const pagos = [
    // Arreglos de hace dos meses
    { fecha: enMes(2, 24), de: "demo-carolina", a: "demo-bruno", monto: 130000 },
    { fecha: enMes(2, 24), de: "demo-ezequiel", a: "demo-bruno", monto: 160000 },
    { fecha: enMes(2, 25), de: "demo-diego", a: yo, monto: 40000 },
    // Arreglos del mes pasado
    { fecha: enMes(1, 24), de: "demo-carolina", a: "demo-bruno", monto: 150000 },
    { fecha: enMes(1, 24), de: "demo-ezequiel", a: "demo-bruno", monto: 140000 },
    { fecha: enMes(1, 25), de: "demo-diego", a: yo, monto: 25000 },
    // Este mes
    { fecha: enMes(0, 9), de: "demo-ezequiel", a: "demo-bruno", monto: 100000 },
  ];
  return pagos.filter(yaPaso);
}

export function generarTareasDemo(yo) {
  return [
    { titulo: "Lavar los platos", responsable: "demo-diego", fechaLimite: hace(2), hecha: false },
    { titulo: "Sacar la basura", responsable: "demo-ezequiel", fechaLimite: hace(-1), hecha: false },
    { titulo: "Hacer las compras de la semana", responsable: yo, fechaLimite: hace(-2), hecha: false },
    { titulo: "Limpiar el baño", responsable: "demo-bruno", fechaLimite: hace(-4), hecha: false },
    { titulo: "Limpiar la cocina", responsable: "demo-carolina", fechaLimite: hace(-6), hecha: false },
    { titulo: "Regar las plantas", responsable: "demo-carolina", fechaLimite: hace(1), hecha: true },
    { titulo: "Pagar las expensas", responsable: yo, fechaLimite: hace(13), hecha: true },
    { titulo: "Cambiar el filtro del agua", responsable: "demo-diego", fechaLimite: hace(20), hecha: true },
  ];
}
