/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** Opcional: si se define (p. ej. correounivalle.edu.co), el registro exige ese dominio. */
  readonly VITE_DOMINIO_CORREO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
