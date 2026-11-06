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

| Variable        | Descripción                                              | Obligatoria | Ejemplo                 |
| --------------- | -------------------------------------------------------- | ----------- | ----------------------- |
| `VITE_API_URL`  | URL base de la API del backend (sin barra final)         | Sí          | `http://localhost:8000` |
| `VITE_USE_MOCK` | `true` usa un dato de ejemplo en vez de la API (solo en `npm run dev`) | No (por defecto `false`) | `false` |

> Las variables `VITE_*` se incrustan en el bundle **en tiempo de build**: son públicas en el navegador. No pongas secretos en ellas.

## Rutas

Definidas en `src/routes/index.tsx` con `react-router-dom` (`createBrowserRouter`). Por ahora las pantallas son placeholders y las rutas privadas **no están protegidas** (pendiente del Sprint 1).

| Ruta                 | Pantalla                    | Layout  |
| -------------------- | --------------------------- | ------- |
| `/`                  | Inicio                      | Público |
| `/ingreso`           | Iniciar sesión              | Público |
| `/registro`          | Crear cuenta                | Público |
| `/registro/usuario`  | Un último paso              | Público |
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

- `src/services/contrato.ts`: ruta del endpoint y tipo de la respuesta. **Contrato provisional**, pendiente de confirmar con BE; cuando se confirme, solo se edita este archivo.
  - `GET /api/base-tecnica` → `{ "mensaje": string, "actualizadoEn": string }`
- `src/services/api.ts`: cliente base con `fetch`. Toma la URL de `VITE_API_URL`, aplica un timeout de 10 s, no usa caché (`cache: 'no-store'`) y convierte errores HTTP y de red en mensajes en español.
- `src/services/baseTecnicaService.ts`: llama al endpoint y valida la forma de la respuesta.
- `src/hooks/useBaseTecnica.ts`: expone `{ data, status, error, reintentar }` (`status`: `'cargando' | 'error' | 'exito'`) y cancela la petición al desmontar el componente.
- `src/components/DatoBaseTecnica.tsx`: muestra el dato en la pantalla principal con 3 estados accesibles (`EstadoCargando`, `EstadoError` con «Reintentar» y `EstadoExito`); los colores son tokens en `src/index.css` (`@theme`).

### Mock (temporal)

Mientras el backend no esté publicado, puedes trabajar con un dato de ejemplo poniendo `VITE_USE_MOCK=true` en tu `.env` y ejecutando `npm run dev`. El servicio responde tras 800 ms sin llamar a la API.

- Solo funciona en desarrollo: en el build de producción (`npm run build`, Docker, Vercel) el mock no se incluye y siempre se llama a la API.
- Está aislado en `src/services/mock.ts`; cuando BE publique la API se elimina ese archivo, el bloque `usarMock` de `baseTecnicaService.ts` y la variable `VITE_USE_MOCK`.

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
