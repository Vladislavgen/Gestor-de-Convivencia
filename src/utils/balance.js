// Calcula cuánto pagó cada miembro, cuánto le corresponde y la diferencia.
// Los gastos se dividen en partes iguales entre todos los miembros.
export function calcularBalance(gastos, miembros) {
  const uids = miembros.map((m) => m.uid);

  // Solo contamos gastos pagados por miembros actuales del hogar
  const gastosValidos = gastos.filter((g) => uids.includes(g.pagadoPor));

  const total = gastosValidos.reduce((acc, g) => acc + g.monto, 0);
  const corresponde = miembros.length > 0 ? total / miembros.length : 0;

  const saldos = miembros.map((miembro) => {
    const pago = gastosValidos
      .filter((g) => g.pagadoPor === miembro.uid)
      .reduce((acc, g) => acc + g.monto, 0);

    return {
      uid: miembro.uid,
      nombre: miembro.nombre,
      pago,
      corresponde,
      diferencia: pago - corresponde, // positivo: le deben, negativo: debe
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
    .map((s) => ({ nombre: s.nombre, resto: -s.diferencia }));

  const acreedores = saldos
    .filter((s) => s.diferencia > 0.01)
    .map((s) => ({ nombre: s.nombre, resto: s.diferencia }));

  const transferencias = [];
  let i = 0;
  let j = 0;

  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].resto, acreedores[j].resto);

    transferencias.push({
      de: deudores[i].nombre,
      a: acreedores[j].nombre,
      monto: Math.round(monto * 100) / 100,
    });

    deudores[i].resto -= monto;
    acreedores[j].resto -= monto;

    if (deudores[i].resto < 0.01) i++;
    if (acreedores[j].resto < 0.01) j++;
  }

  return transferencias;
}
