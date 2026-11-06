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

| Variable       | Descripción                          | Obligatoria | Ejemplo                  |
| -------------- | ------------------------------------ | ----------- | ------------------------ |
| `VITE_API_URL` | URL base de la API del backend       | Sí (cuando exista la API) | `http://localhost:8000` |

> Las variables `VITE_*` se incrustan en el bundle **en tiempo de build**: son públicas en el navegador. No pongas secretos en ellas.

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
