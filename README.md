# Salón de Estudio Colaborativo — Frontend

Frontend de la aplicación web **Salón de Estudio Colaborativo**. Este repositorio contiene la base técnica del proyecto (ticket FE-01, Sprint 0): React + TypeScript + Vite con Tailwind CSS, empaquetado con Docker/nginx y listo para desplegar en Vercel.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (plugin oficial `@tailwindcss/vite`)
- Docker (build con `node:20-alpine`, servido con `nginx:alpine`)

## Estructura

```
frontend/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── pages/        # Pantallas / vistas
│   ├── services/     # Cliente de la API (pendiente)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css     # Importación de Tailwind
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── vercel.json
└── .env.example
```

## Requisitos

- Node.js 20 (mínimo 20.19) y npm
- Docker y Docker Compose (opcional, para ejecutar en contenedor)

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

| Variable       | Descripción                                      | Obligatoria | Ejemplo                 |
| -------------- | ------------------------------------------------ | ----------- | ----------------------- |
| `VITE_API_URL` | URL base de la API del backend (sin barra final) | Sí          | `http://localhost:8000` |

> Las variables `VITE_*` se incrustan en el bundle **en tiempo de build**: son públicas en el navegador. No pongas secretos en ellas.

## Rutas

Definidas en `src/routes/index.tsx` con `react-router-dom` (`createBrowserRouter`). Desde el Sprint 1 las rutas privadas están protegidas (`src/routes/guardas.tsx`).

| Ruta                 | Pantalla                    | Layout  |
| -------------------- | --------------------------- | ------- |
| `/`                  | Inicio                      | Público |
| `/ingreso`           | Iniciar sesión              | Acceso  |
| `/registro`          | Crear cuenta                | Acceso  |
| `/registro/usuario`  | Un último paso (elegir username, solo Google) | Acceso |
| `/base-tecnica`      | Base técnica (dato de la API) | Público |
| `/accesibilidad`     | Accesibilidad               | Público |
| `/salas`             | Mis salas                   | Privado |
| `/salas/crear`       | Crear una sala              | Privado |
| `/salas/unirse`      | Unirse a una sala           | Privado |
| `/salas/:id`         | Sala                        | Privado |
| `/salas/:id/editar`  | Editar sala                 | Privado |
| `/perfil`            | Mi perfil                   | Privado |
| `/perfil/editar`     | Editar perfil               | Privado |
| `/perfil/eliminar`   | Eliminar cuenta             | Privado |
| `*`                  | Página no encontrada (404)  | Público |

## Accesibilidad base

Objetivo: WCAG 2.2 AA. Incluye:

- **Idioma:** `<html lang="es">`.
- **Títulos por página:** «Nombre de la pantalla · Salón de Estudio» (`useTituloPagina`).
- **Regiones:** `<header>`, `<nav aria-label>` (Principal, Salas, Cuenta), `<main id="contenido">` y `<footer>`; un solo `<h1>` por página.
- **Enlace «Saltar al contenido»:** primer elemento enfocable; aparece arriba a la izquierda al recibir foco y lleva el foco al `<main>` (`SaltarAlContenido`).
- **Foco visible:** contorno de 2 px en `--color-acento` (contraste ≥ 3:1 sobre todos los fondos); nada fijo lo tapa ni lo recorta.
- **Foco al navegar:** al cambiar de ruta el foco pasa al `<h1>` de la nueva página y el scroll vuelve arriba (`useFocoAlNavegar`); no ocurre en la primera carga.
- Controles de mínimo 48 px de alto, página actual con `aria-current="page"` y respeto de `prefers-reduced-motion`.

**Cómo comprobarlo con el teclado**

1. Carga cualquier ruta y pulsa `Tab`: aparece «Saltar al contenido». Pulsa `Enter`: el siguiente `Tab` ya está dentro del contenido (o en el pie si la página no tiene controles).
2. Sigue con `Tab` / `Shift+Tab`: el orden es enlace de salto → encabezado o barra lateral → contenido → pie, y el contorno se ve siempre.
3. Activa un enlace con `Enter`: la nueva página carga y el lector de pantalla anuncia su `<h1>`.
4. En `/base-tecnica` con error, «Reintentar» se activa con `Enter` o `Espacio`.

## Consumo de la API

El frontend **nunca** accede a Firestore directamente: todos los datos llegan a través de la API (Node.js en Render).

- `src/services/contrato.ts`: ruta del endpoint y tipo de la respuesta. Si el contrato cambia, solo se edita este archivo.
  - `GET /api/v1/base` → `{ "data": { "message": string } }`
- `src/services/api.ts`: cliente base con `fetch`. Toma la URL de `VITE_API_URL`, aplica un timeout de 60 s, no usa caché (`cache: 'no-store'`) y distingue en español: sin conexión, el servidor tardó demasiado y error del servidor.
- `src/services/baseTecnicaService.ts`: llama al endpoint, valida la forma de la respuesta y devuelve el contenido de `data`.
- `src/hooks/useBaseTecnica.ts`: expone `{ data, status, error, reintentar }` (`status`: `'cargando' | 'error' | 'exito'`) y cancela la petición al desmontar el componente.
- `src/components/DatoBaseTecnica.tsx`: muestra el dato en la pantalla principal con 3 estados accesibles (`EstadoCargando`, `EstadoError` con «Reintentar» y `EstadoExito`); los colores son tokens en `src/index.css` (`@theme`).

### Conexión con la API

- **En local:** crea un archivo `.env` (está en `.gitignore`, no se sube al repositorio) con la URL de la API publicada y reinicia `npm run dev`:

  ```bash
  VITE_API_URL=https://<tu-backend>.onrender.com
  ```

  Docker Compose lee el mismo `.env` y la pasa como *build arg*.
- **En Vercel:** *Settings → Environment Variables* → `VITE_API_URL` con la URL de la API (Production y Preview) y vuelve a desplegar: Vite la incrusta en el build.
- La API solo acepta peticiones de los orígenes configurados en su CORS (el dominio de Vercel y `http://localhost:5173` para desarrollo).
- **Servidor dormido:** el backend usa el plan gratuito de Render, que se duerme tras ~15 minutos sin uso. La primera petición puede tardar cerca de un minuto: a los 5 s la pantalla de carga avisa «El servidor puede tardar hasta un minuto en despertar.» y, si pasa de 60 s, se muestra el error con «Reintentar».

## Ejecutar en local (npm)

```bash
npm install
npm run dev
```

La app queda disponible en http://localhost:5173.

Otros scripts:

| Comando           | Descripción                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente |
| `npm run build`   | Chequeo de tipos (`tsc`) y build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de producción       |

## Ejecutar con Docker

```bash
cp .env.example .env   # si aún no existe
docker compose up --build
```

La app queda disponible en http://localhost:5173 (nginx escucha en el puerto 80 del contenedor). Docker Compose lee `VITE_API_URL` del archivo `.env` y la pasa como *build arg* al `Dockerfile`.

Para detenerla:

```bash
docker compose down
```

## Despliegue en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com/new).
2. Si el repositorio contiene más carpetas, define **Root Directory** como `frontend`.
3. Vercel detecta Vite automáticamente:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. En **Settings → Environment Variables** agrega `VITE_API_URL` con la URL de la API para cada entorno (Production / Preview).
5. Despliega. El archivo `vercel.json` reescribe todas las rutas a `/index.html`, de modo que las rutas del cliente (React Router) funcionan al recargar la página.

Cada push a la rama configurada genera un nuevo despliegue automáticamente.

## Autenticación (Sprint 1: TS-01, US-01, US-02, US-03)

- **Firebase Auth** (correo/contraseña y Google) se usa solo desde `src/services/firebase.ts`. La configuración sale de `VITE_FIREBASE_*` (ver `.env.example`; en Vercel se agregan igual que `VITE_API_URL`).
- **Estado de sesión:** `src/context/AuthContext.tsx` (`useAuth()`): `cargando | anonimo | sin-username | autenticado | error`.
- **Interceptor:** `peticion()` en `src/services/api.ts` agrega `Authorization: Bearer <ID Token>` en las peticiones con `autenticada: true`. Si la API responde 401 renueva el token y reintenta una vez.
- **Guardas** (`src/routes/guardas.tsx`):
  - `RutaPrivada`: sin sesión → `/ingreso` y, tras entrar, vuelve a la ruta pedida; con Google sin username → `/registro/usuario`.
  - `RutaSoloInvitados`: `/ingreso` y `/registro` redirigen al panel si ya hay sesión.
  - `RutaCompletarPerfil`: `/registro/usuario` solo para quien entró con Google sin username.
- **Contrato con la API:** rutas, campos y códigos de error en `src/services/contrato.ts` (solo se edita ahí).
- **Reglas de los formularios:** `src/utils/validaciones.ts` (contraseña ≥ 8 con mayúscula, minúscula y número; username 3–20 con letras, números, `.` o `_`).
- `VITE_DOMINIO_CORREO` (opcional) obliga a que el correo del registro termine en ese dominio.
