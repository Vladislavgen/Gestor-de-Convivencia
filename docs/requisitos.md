# Requisitos — Gestor de Convivencia

## Descripción

Aplicación web para personas que viven juntas. Permite registrar los gastos compartidos del hogar, calcular cuánto le corresponde a cada miembro y quién le debe a quién, y organizar las tareas de la casa.

## Usuarios

- **Visitante:** persona sin sesión. Solo puede registrarse o iniciar sesión.
- **Usuario sin hogar:** tiene cuenta pero todavía no creó ni se unió a un hogar.
- **Miembro:** pertenece a un hogar. Carga gastos y tareas y ve el balance.

Una cuenta pertenece a un solo hogar.

## Requisitos funcionales

| ID | Nombre | Descripción |
|---|---|---|
| RF-01 | Registro | El visitante crea una cuenta con nombre, correo y contraseña. |
| RF-02 | Inicio de sesión | El usuario ingresa con correo y contraseña o con su cuenta de Google. La sesión se mantiene al recargar la página. |
| RF-03 | Cerrar sesión | El usuario cierra la sesión y vuelve a la pantalla de acceso. |
| RF-04 | Crear hogar | Un usuario sin hogar crea uno con un nombre. Se genera un código de invitación de 6 caracteres. |
| RF-05 | Unirse a un hogar | Un usuario sin hogar ingresa un código y pasa a ser miembro. Un código inexistente muestra un error. |
| RF-06 | Ver hogar | El miembro ve el nombre del hogar, el código de invitación y la lista de miembros. Puede salir del hogar previa confirmación. |
| RF-07 | Cargar gasto | El miembro registra un gasto con concepto, monto, fecha, categoría y quién lo pagó. El formulario valida los datos antes de guardar. |
| RF-08 | Editar y eliminar gasto | El miembro edita o elimina un gasto. Antes de eliminar se pide confirmación. |
| RF-09 | Filtrar gastos | El historial se filtra por categoría y por quién pagó, y muestra el total de los gastos filtrados. |
| RF-10 | Cargar gasto con IA | El miembro escribe una frase en lenguaje natural. Gemini propone concepto, monto, categoría, pagador y fecha; el usuario revisa y confirma antes de guardar. Si la IA falla, se muestra un mensaje y el formulario manual sigue disponible. |
| RF-11 | Balance | Se muestra, por miembro, cuánto pagó y la diferencia con lo que le corresponde (los gastos se dividen en partes iguales). Se puede filtrar por mes. |
| RF-12 | Transferencias | Se muestra la lista de transferencias ("A le pasa X a B") que deja los saldos en cero. |
| RF-13 | Tareas | El miembro crea tareas con título, responsable y fecha límite, las marca como hechas o pendientes y las elimina. Una tarea pendiente con fecha vencida se marca como vencida. |

## Requisitos no funcionales

| ID | Descripción |
|---|---|
| RNF-01 | Interfaz en español, responsive, usable desde el celular. |
| RNF-02 | Los datos se guardan en Cloud Firestore y se actualizan en tiempo real para todos los miembros del hogar. |
| RNF-03 | Sin sesión iniciada no se puede acceder a ninguna pantalla del hogar ni leer datos. |
| RNF-04 | Las claves de Firebase y Gemini se cargan por variables de entorno y no se suben al repositorio. |
| RNF-05 | Los errores de Firebase y de Gemini se muestran en pantalla con un mensaje claro. |
| RNF-06 | La aplicación está desplegada en Vercel con despliegue continuo desde GitHub. |
