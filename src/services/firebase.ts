import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'

/**
 * Configuración web de Firebase. Estos valores son públicos en el navegador
 * (no son secretos), pero se leen de variables de entorno para no dejarlos
 * escritos en el repositorio. Se definen en `.env` y en Vercel.
 */
const configuracion: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigurado = Object.values(configuracion).every(
  (valor) => typeof valor === 'string' && valor.trim() !== '',
)

// Si falta la configuración no se inicializa: la app muestra un aviso claro en vez de romperse.
const app = firebaseConfigurado ? initializeApp(configuracion) : null

export const auth = app ? getAuth(app) : null
