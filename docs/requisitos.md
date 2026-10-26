# Requisitos — Gestor de Convivencia

Especificación del segundo parcial de Plataformas de Desarrollo.
La consigna fija el marco técnico: React con Vite, Firebase Authentication,
Cloud Firestore, una función real de Google AI Studio (Gemini), repositorio
en GitHub con trabajo del grupo y despliegue en producción.

## 1. Introducción

### 1.1 Propósito

Definir qué debe hacer Gestor de Convivencia: una aplicación web para personas
que viven juntas (pareja, amigos o compañeros de piso). El grupo registra el
alquiler, los gastos comunes, los gastos personales y las obligaciones, y ve
quién le debe a quién.

### 1.2 Usuarios y actores

- **Visitante:** persona sin sesión. Solo ve el acceso.
- **Usuario autenticado:** cuenta de Firebase aún sin hogar, o miembro de un hogar.
- **Administrador:** miembro que creó el hogar o recibió el rol. Configura el hogar, los miembros y el alquiler, y cierra el período.
- **Miembro:** cualquier integrante activo, incluido el administrador. Carga gastos, obligaciones y pagos, y ve los saldos.

En esta versión una cuenta pertenece a un solo hogar.

### 1.3 Alcance

Incluye:

- registro e inicio de sesión con Firebase Authentication;
- un hogar por cuenta, con código de invitación;
- alquiler, gastos comunes, gastos personales, obligaciones y pagos entre miembros;
- saldo del período y transferencias mínimas, calculados por la aplicación;
- un borrador de gasto común a partir de una frase, vía Gemini, guardado solo después de confirmar;
- persistencia en Cloud Firestore;
- interfaz en español, usable en escritorio y en el teléfono.

No incluye:

- pagos reales (transferencia bancaria, Mercado Pago);
- lectura de tickets por foto;
- avisos por correo o push;
- aplicación nativa;
- varios hogares por cuenta;
- que la IA calcule saldos, cierre el mes o guarde un gasto sin confirmación.

### 1.4 Decisiones fijadas por la consigna

| Tema | Decisión |
|---|---|
| Cliente | React, proyecto iniciado con Vite, componentes reutilizables. |
| Arranque local | Docker Compose. En el host solo hace falta Docker; Vite corre dentro del contenedor. |
| Identidad | Firebase Authentication: correo y contraseña, y acceso con Google en la misma pantalla. |
| Datos | Cloud Firestore. |
| IA | Gemini, desde Google AI Studio. Propone un borrador; no escribe en la base por su cuenta. |
| Montos | Enteros en centavos. El resto de un reparto igual se asigna al último miembro para que la suma cierre. |
| Idioma de la interfaz | Español. Fechas `DD/MM/AAAA`. |
| Entrega | Repositorio GitHub del grupo y sitio desplegado (Vercel o Firebase Hosting) con despliegue continuo. |

## 2. Requisitos funcionales

Prioridad **Alta:** sin esto no hay producto ni se cubre la consigna.
Prioridad **Media:** capa siguiente, dentro del mismo alcance.

| ID | Nombre | Descripción | Actor | Prioridad |
|---|---|---|---|---|
| RF-01 | Registro e inicio de sesión | La persona se registra e inicia sesión con correo y contraseña. La misma pantalla ofrece el acceso con Google. La sesión sigue activa al recargar. Cerrar sesión vuelve a la pantalla de acceso y oculta los datos del hogar. | Visitante | Alta |
| RF-02 | Crear hogar | Un usuario autenticado crea un hogar con nombre y moneda (ARS por defecto). Queda como administrador, vinculado a su `uid`. El hogar recibe un código de invitación único para compartir. | Usuario autenticado | Alta |
| RF-03 | Unirse con código | Un usuario autenticado ingresa el código y pasa a ser miembro de ese hogar. Un código inexistente se rechaza con un mensaje claro. Una cuenta no puede unirse a un segundo hogar. | Usuario autenticado | Alta |
| RF-04 | Editar miembros y rol | El administrador edita el nombre visible de un miembro y puede transferir el rol de administrador a otro miembro activo. Si el miembro ya tiene movimientos, no se borra: se desactiva y su historial queda. Un miembro inactivo no entra en los repartos nuevos. | Administrador | Alta |
| RF-05 | Regla de alquiler | El administrador define el alquiler del hogar: monto total y reparto en partes iguales, por porcentaje o por monto fijo entre los miembros activos. Los porcentajes y los montos fijos deben cerrar con el total; si no, la regla no se guarda. | Administrador | Alta |
| RF-06 | Cargo de alquiler del período | El administrador genera una sola vez el cargo de alquiler del período abierto, a partir de la regla vigente, e indica quién lo pagó. Un segundo cargo en el mismo período se rechaza. | Administrador | Alta |
| RF-07 | Alta de gasto común | Un miembro registra un gasto común con fecha, concepto, monto, miembro que pagó y categoría. | Miembro | Alta |
| RF-08 | Reparto del gasto común | El gasto se reparte entre todos los miembros activos por igual, por porcentaje, entre un subconjunto o con montos manuales. La suma del reparto debe coincidir con el monto. Un reparto que no cierra no se guarda. | Miembro | Alta |
| RF-09 | Editar y eliminar gasto común | Un miembro edita o elimina un gasto común. El saldo del período se recalcula al guardar. | Miembro | Alta |
| RF-10 | Saldo del período | Cada miembro ve, por integrante activo e inactivo con movimientos: cuánto pagó, cuánto le corresponde y la diferencia a favor o en contra. La suma de las diferencias del período es cero. | Miembro | Alta |
| RF-11 | Transferencias mínimas | La aplicación muestra la lista «A le pasa X a B» que deja todos los saldos en cero, con la menor cantidad de transferencias. | Miembro | Alta |
| RF-12 | Pago entre miembros | Un miembro registra un pago interno: deudor, acreedor, monto y fecha. El saldo de ambos se actualiza. El pago no es un gasto común ni un gasto personal. | Miembro | Alta |
| RF-13 | Permisos del hogar | El administrador configura el hogar, los miembros, la regla de alquiler y el cierre del período. Cualquier miembro activo carga gastos, obligaciones y pagos. Todos los miembros del hogar ven los saldos y los movimientos. | Administrador, Miembro | Alta |
| RF-14 | Confirmación al borrar | Antes de eliminar el hogar, un gasto o una obligación, y antes de desactivar un miembro, la interfaz pide confirmación. Cancelar no cambia los datos. | Administrador, Miembro | Alta |
| RF-15 | Gasto en lenguaje natural | Un miembro escribe una frase, por ejemplo «Pagué 12000 de supermercado para todos». Gemini propone concepto, monto, categoría, pagador y reparto. El usuario corrige el borrador si hace falta. El gasto se guarda en Firestore solo al confirmar. Si Gemini falla, la interfaz muestra el error y el formulario manual de RF-07 sigue disponible. | Miembro | Alta |
| RF-16 | Alta de gasto personal | Un miembro registra un gasto personal con fecha, concepto, monto y miembro. Entra en el resumen personal del mes y no modifica la deuda compartida ni las transferencias. | Miembro | Media |
| RF-17 | Editar y eliminar gasto personal | Un miembro edita o elimina un gasto personal. El resumen personal se actualiza y el saldo compartido no cambia. | Miembro | Media |
| RF-18 | Categorías | El hogar dispone de categorías fijas: alquiler, servicios, comida, limpieza, transporte y otro. El administrador puede agregar una categoría propia del hogar. Todo gasto común elige una categoría. | Administrador, Miembro | Media |
| RF-19 | Alta de obligación | Un miembro crea una obligación con título, descripción, responsable (miembro activo), frecuencia (única, semanal o mensual) y fecha límite. | Miembro | Media |
| RF-20 | Estado de la obligación | El responsable, u otro miembro, la marca hecha o pendiente. Si está hecha y la frecuencia es semanal o mensual, la próxima fecha límite se calcula sola y la obligación vuelve a pendiente. Si la fecha límite ya pasó y no está hecha, se muestra vencida sin una acción manual extra. | Miembro | Media |
| RF-21 | Reasignar obligación | Un miembro cambia el responsable de una obligación a otro miembro activo del hogar. | Miembro | Media |
| RF-22 | Cierre de período | El administrador cierra el mes: los movimientos de ese período quedan congelados (no se editan ni se borran) y se abre el mes siguiente con la misma regla de alquiler, sin copiar los gastos. | Administrador | Media |
| RF-23 | Resumen del mes | La vista del período muestra el total común, el total personal por miembro, el alquiler y el conteo de obligaciones cumplidas frente a vencidas. | Miembro | Media |
| RF-24 | Filtros de movimientos | El listado se filtra por miembro, categoría, tipo (común, personal, alquiler, pago) y rango de fechas. | Miembro | Media |
| RF-25 | Exportar CSV | Un miembro descarga un CSV del período con los movimientos y los saldos. Los montos salen con dos decimales. | Miembro | Media |

## 3. Requisitos no funcionales

| ID | Descripción | Categoría |
|---|---|---|
| RNF-01 | Interfaz en español, comprensible en escritorio y en el teléfono. Cliente React iniciado con Vite, armado con componentes reutilizables y carpetas modulares. | Usabilidad |
| RNF-02 | Los datos del hogar viven en Cloud Firestore. Siguen disponibles al recargar, al cerrar sesión y al entrar de nuevo desde otro dispositivo. | Datos |
| RNF-03 | Los montos se guardan en centavos enteros. Pagado, corresponde y transferencias cierran al centavo. El saldo lo calcula la aplicación. Gemini no participa en ese cálculo. | Precisión |
| RNF-04 | No se guardan montos no positivos, repartos que no suman el total ni fechas inválidas. El mensaje de error aparece junto al campo. | Usabilidad |
| RNF-05 | Las reglas de Firestore limitan la lectura y la escritura al hogar de la cuenta autenticada. Sin sesión no se leen ni se escriben datos del hogar. | Seguridad |
| RNF-06 | En desarrollo la aplicación arranca con `docker compose up --build`. Dentro del contenedor se ejecuta Vite; en el host solo hace falta Docker. La entrega queda desplegada en Vercel o Firebase Hosting, con el repositorio de GitHub conectado para despliegue continuo. | Operación |
| RNF-07 | La clave de Gemini y el resto de secretos no se suben al repositorio. Entran por variables de entorno del entorno de despliegue. No hay clave de cuenta de servicio en el cliente. | Seguridad |
| RNF-08 | El saldo de un período de hasta 500 movimientos se calcula al abrir la vista, dentro de la misma carga. | Operación |
| RNF-09 | Las fechas se muestran como `DD/MM/AAAA` y los montos con dos decimales y la moneda del hogar. | Usabilidad |
| RNF-10 | Cada campo de formulario tiene una etiqueta visible. El alta manual de un gasto se puede completar con teclado. | Usabilidad |
| RNF-11 | Un fallo de Firebase o de Gemini se explica en la pantalla. Los flujos de acceso, alta de gasto y consulta del saldo no dejan errores sin controlar en la consola del navegador. | Operación |
| RNF-12 | El repositorio refleja a todo el grupo: commits descriptivos (`feat`, `fix`) de cada integrante, con ramas y pull requests. Un solo integrante sube en el campus los nombres, la temática en dos líneas, el link al repositorio y el link de producción. | Entrega |

## 4. Escenarios de aceptación

1. **Acceso y hogar.** Una persona se registra con correo y contraseña, crea un hogar y obtiene un código. Otra se registra, ingresa el código y ve el mismo hogar. Al cerrar sesión y volver a entrar, el hogar y los miembros siguen en Firestore.
2. **Reparto inválido.** Un gasto de 10.000 con partes que suman 9.000 no se guarda. El formulario indica que el reparto no cierra.
3. **Saldo y transferencia.** Con el alquiler y un gasto común pagado por una sola persona, la vista muestra el saldo de cada miembro y las transferencias que dejan esos saldos en cero.
4. **Pago entre miembros.** Al registrar que el deudor ya le pagó al acreedor, el saldo de ambos cambia en esa misma vista.
5. **Gasto personal.** Un gasto personal figura en el resumen de esa persona y no mueve la deuda compartida ni las transferencias.
6. **Gasto por frase.** La frase «Pagué 12000 de supermercado para todos» produce un borrador con monto, concepto y reparto. Hasta confirmar, Firestore no tiene ese gasto. Si Gemini no responde, el alta manual del mismo gasto sigue disponible.
