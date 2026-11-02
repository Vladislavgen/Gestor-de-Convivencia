# Gestor de Convivencia

Aplicación web para personas que viven juntas (pareja, amigos, compañeros de depto). Permite cargar los gastos compartidos, ver cuánto le corresponde a cada uno y quién le debe a quién, registrar los pagos entre miembros y organizar las tareas de la casa.

Trabajo práctico para la materia **Plataformas de Desarrollo** (Parcial 2).

## Funcionalidades

- Registro e inicio de sesión con correo/contraseña o con Google (Firebase Authentication).
- Creación de un hogar con código de invitación para que se unan los demás.
- Inicio con el resumen del mes: total gastado, tu saldo, tareas pendientes, últimos gastos y próximas tareas.
- Carga, edición y eliminación de gastos compartidos, con búsqueda y filtros por categoría y por quién pagó.
- Carga de gastos con inteligencia artificial: se escribe una frase ("Pagué 12000 de supermercado") y Gemini completa el formulario.
- Resumen del mes generado con Gemini: en qué se fue la plata y un consejo para el mes siguiente.
- Balance del hogar: cuánto pagó cada uno, cuánto le corresponde, gastos por categoría y las transferencias para saldar las cuentas, por mes o en total.
- Pagos entre miembros: cuando alguien transfiere plata a otro, se registra y el balance se actualiza.
- Tareas de la casa con responsable, fecha límite y estado (pendiente, hecha, vencida).
- Diseño responsive para usar desde el celular.

## Tecnologías

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/) para la navegación
- [Firebase](https://firebase.google.com/): Authentication y Cloud Firestore
- [Gemini API](https://ai.google.dev/) (Google AI Studio) a través de `@google/genai`
- CSS puro

## Cómo correr el proyecto

1. Clonar el repositorio e instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` a partir de `.env.example` y completar las claves de Firebase y de Gemini.

3. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación queda en [http://localhost:5173](http://localhost:5173).

También se puede levantar con Docker, sin instalar Node en la máquina:

```bash
docker compose up --build
```

## Configuración de Firebase

1. Crear un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. En **Authentication** habilitar los proveedores *Correo electrónico/contraseña* y *Google*.
3. En **Firestore Database** crear la base de datos y pegar las reglas del archivo `firestore.rules`.
4. Registrar una app web y copiar la configuración al archivo `.env`.

Para el despliegue, agregar el dominio del hosting en **Authentication > Settings > Authorized domains**.

## Estructura del proyecto

```
src/
  components/   Componentes reutilizables (Navbar, AuthLayout, GastoForm, AsistenteIA, ...)
  context/      AuthContext: usuario logueado, perfil y hogar
  hooks/        useGastos, usePagos, useTareas: lectura en tiempo real desde Firestore
  pages/        Pantallas: Login, Registro, Inicio, Hogar, Gastos, Balance, Tareas
  services/     Configuración de Firebase y llamadas a Gemini
  utils/        Funciones auxiliares (balance, formato, categorías, errores)
```

## Integrantes

- Nombre Apellido
- Nombre Apellido
