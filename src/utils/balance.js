// Calcula cuánto pagó cada miembro, cuánto le corresponde y la diferencia.
// Los gastos se dividen en partes iguales entre todos los miembros.
// Los pagos entre miembros (por ejemplo "Caro le pasó 7000 a Ana") también
// cuentan: suman al que pagó y restan al que recibió.
export function calcularBalance(gastos, pagos, miembros) {
  const uids = miembros.map((m) => m.uid);

  // Solo contamos movimientos de miembros actuales del hogar
  const gastosValidos = gastos.filter((g) => uids.includes(g.pagadoPor));
  const pagosValidos = pagos.filter(
    (p) => uids.includes(p.de) && uids.includes(p.a),
  );

  const total = gastosValidos.reduce((acc, g) => acc + g.monto, 0);
  const corresponde = miembros.length > 0 ? total / miembros.length : 0;

  const saldos = miembros.map((miembro) => {
    const pago = gastosValidos
      .filter((g) => g.pagadoPor === miembro.uid)
      .reduce((acc, g) => acc + g.monto, 0);

    const pagosHechos = pagosValidos
      .filter((p) => p.de === miembro.uid)
      .reduce((acc, p) => acc + p.monto, 0);

    const pagosRecibidos = pagosValidos
      .filter((p) => p.a === miembro.uid)
      .reduce((acc, p) => acc + p.monto, 0);

    return {
      uid: miembro.uid,
      nombre: miembro.nombre,
      pago,
      pagosHechos,
      pagosRecibidos,
      corresponde,
      // positivo: le deben, negativo: debe
      diferencia: pago - corresponde + pagosHechos - pagosRecibidos,
    };
  });

  return {
    total,
    corresponde,
    saldos,
    transferencias: calcularTransferencias(saldos),
  };
}

// Arma la lista "A le paga X a B" para que todos queden en cero.
// Se recorren los que deben y los que tienen a favor de a uno.
function calcularTransferencias(saldos) {
  const deudores = saldos
    .filter((s) => s.diferencia < -0.01)
    .map((s) => ({ uid: s.uid, nombre: s.nombre, resto: -s.diferencia }));

  const acreedores = saldos
    .filter((s) => s.diferencia > 0.01)
    .map((s) => ({ uid: s.uid, nombre: s.nombre, resto: s.diferencia }));

  const transferencias = [];
  let i = 0;
  let j = 0;

  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].resto, acreedores[j].resto);

    transferencias.push({
      de: deudores[i].nombre,
      deUid: deudores[i].uid,
      a: acreedores[j].nombre,
      aUid: acreedores[j].uid,
      monto: Math.round(monto * 100) / 100,
    });

    deudores[i].resto -= monto;
    acreedores[j].resto -= monto;

    if (deudores[i].resto < 0.01) i++;
    if (acreedores[j].resto < 0.01) j++;
  }

  return transferencias;
}

// Historial mes a mes: total, cantidad de gastos y variación contra el mes anterior.
// Devuelve los meses del más nuevo al más viejo.
export function resumenPorMes(gastos) {
  const porMes = {};

  gastos.forEach((gasto) => {
    const mes = gasto.fecha.slice(0, 7); // "YYYY-MM"
    if (!porMes[mes]) {
      porMes[mes] = { mes, total: 0, cantidad: 0 };
    }
    porMes[mes].total += gasto.monto;
    porMes[mes].cantidad += 1;
  });

  const meses = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes));

  // Variación en porcentaje respecto del mes anterior (null para el primero)
  meses.forEach((item, indice) => {
    const anterior = meses[indice - 1];
    item.variacion =
      anterior && anterior.total > 0
        ? ((item.total - anterior.total) / anterior.total) * 100
        : null;
  });

  return meses.reverse();
}

// Total gastado por categoría, de mayor a menor
export function totalPorCategoria(gastos) {
  const totales = {};

  gastos.forEach((gasto) => {
    totales[gasto.categoria] = (totales[gasto.categoria] || 0) + gasto.monto;
  });

  return Object.keys(totales)
    .map((categoria) => ({ categoria, total: totales[categoria] }))
    .sort((a, b) => b.total - a.total);
}
