import { GoogleGenAI } from "@google/genai";
import { CATEGORIAS } from "../utils/categorias";
import { hoy } from "../utils/formato";

const MODELO = "gemini-3.8-flash";

function crearCliente() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar la clave de Gemini (VITE_GEMINI_API_KEY)");
  }
  return new GoogleGenAI({ apiKey });
}

// Recibe una frase como "Pagué 12000 de supermercado" y devuelve
// un objeto con los datos del gasto para completar el formulario.
export async function interpretarGasto(frase, miembros, nombreUsuario) {
  const ai = crearCliente();
  const nombres = miembros.map((m) => m.nombre).join(", ");

  const prompt = `
Sos el asistente de una aplicación para dividir gastos entre personas que viven juntas.
A partir de la frase del usuario, extraé los datos del gasto y respondé SOLO con un JSON con este formato:
{"concepto": string, "monto": number, "categoria": string, "pagadoPor": string, "fecha": string | null}

Reglas:
- "concepto" es una descripción corta del gasto (por ejemplo "Supermercado").
- "monto" es un número sin símbolos. Si no hay monto en la frase, devolvé 0.
- "categoria" tiene que ser exactamente una de estas: ${CATEGORIAS.join(", ")}.
- "pagadoPor" tiene que ser exactamente uno de estos nombres: ${nombres}.
  Si la frase dice "pagué" o no aclara quién pagó, usá "${nombreUsuario}".
- "fecha" en formato YYYY-MM-DD. Si la frase no menciona una fecha, devolvé null.
- Hoy es ${hoy()}.

Frase del usuario: "${frase}"
`;

  const respuesta = await ai.models.generateContent({
    model: MODELO,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(respuesta.text);
}

// Recibe los gastos de un período y devuelve un resumen corto en texto,
// con observaciones y un consejo para el hogar.
export async function resumirGastos(gastos, nombrePeriodo) {
  const ai = crearCliente();

  const lineas = gastos
    .slice(0, 100)
    .map((g) => `- ${g.fecha} | ${g.concepto} | ${g.categoria} | ${g.monto} | pagó ${g.pagador}`)
    .join("\n");

  const prompt = `
Sos el asistente de una aplicación para personas que viven juntas y comparten gastos.
Escribí un resumen de los gastos de ${nombrePeriodo} en español rioplatense (voseo), en 3 o 4 oraciones,
sin títulos, sin listas y sin markdown. Mencioná el total gastado, en qué categorías se fue la mayor parte,
quién pagó más y un consejo breve y concreto para el mes que viene. Los montos están en pesos argentinos.

Gastos (fecha | concepto | categoría | monto | quién pagó):
${lineas}
`;

  const respuesta = await ai.models.generateContent({
    model: MODELO,
    contents: prompt,
  });

  return respuesta.text;
}
