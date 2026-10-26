# Gestor de Convivencia

Aplicación web para personas que viven juntas: pareja, amigos o compañeros de piso. Registra el alquiler, los gastos comunes, los gastos personales y las obligaciones, y muestra cuánto le corresponde a cada persona.

La especificación está en [docs/requisitos.md](docs/requisitos.md). El estado para retomar el trabajo está en [docs/context.md](docs/context.md).

## Qué hay ahora

El repositorio arranca el cliente React con Vite. La pantalla confirma que el entorno local está en marcha. El registro, el hogar y los saldos vienen en los siguientes pasos.

## Arranque local

Hace falta Docker con Docker Compose. Node y las dependencias no se instalan en el host: el contenedor las instala solo cuando cambia `package-lock.json`.

Compose usa DNS públicos (`8.8.8.8` y `1.1.1.1`) para no depender del resolver interno de Docker. Si `registry.npmjs.org` no responde, el contenedor descarga los mismos paquetes desde `registry.npmmirror.com` y deja `package-lock.json` sin cambios.

```bash
docker compose up --build
```

Abrir [http://localhost:5173](http://localhost:5173).

Para detenerlo, `Ctrl+C` y después:

```bash
docker compose down
```

El código del proyecto está montado dentro del contenedor. Un cambio en `src/` se refleja en el navegador sin reconstruir la imagen.

## Variables

Firebase y Gemini todavía no están conectados. Cuando haga falta, copiar el ejemplo y completar los valores:

```bash
cp .env.example .env
```

`.env` no se sube al repositorio. La clave de Gemini no lleva el prefijo `VITE_`, para que no entre en el bundle del navegador.

## Stack previsto

React y Vite en el cliente, Firebase Authentication y Cloud Firestore para cuentas y datos, Gemini para el borrador de un gasto a partir de una frase. El despliegue de entrega es Vercel o Firebase Hosting, según [docs/requisitos.md](docs/requisitos.md).
