// Contrato del endpoint de la base técnica (confirmado contra la API publicada).
// Ejemplo de respuesta: { "data": { "message": "Hola desde Firestore" } }

/** Ruta del endpoint que devuelve el dato de la base técnica (leído de Firestore por la API). */
export const RUTA_BASE_TECNICA = '/api/v1/base'

/** Dato limpio que recibe la interfaz. */
export interface BaseTecnica {
  message: string
}

/** Respuesta tal como la envía la API: el dato viene envuelto en `data`. */
export interface RespuestaBaseTecnica {
  data: BaseTecnica
}

/** Comprueba en tiempo de ejecución que la respuesta tiene la forma esperada. */
export function esRespuestaBaseTecnica(valor: unknown): valor is RespuestaBaseTecnica {
  if (typeof valor !== 'object' || valor === null) return false
  const data = (valor as Record<string, unknown>).data
  if (typeof data !== 'object' || data === null) return false
  return typeof (data as Record<string, unknown>).message === 'string'
}

// ---------------------------------------------------------------------------
// Autenticación y usuarios (Sprint 1).
// OJO: los nombres de campos y códigos de error son el acuerdo con Backend.
// Si Backend los cambia, solo se edita esta sección.
// ---------------------------------------------------------------------------

export const RUTA_REGISTRO = '/api/v1/users/profile'
export const RUTA_COMPLETAR_GOOGLE = '/api/v1/users/profile'
export const RUTA_MI_PERFIL = '/api/v1/users/me'

/** Códigos de error que devuelve la API en `{ error: { code } }`. */
export const CODIGO_USERNAME_OCUPADO = 'USERNAME_TAKEN'
export const CODIGO_CORREO_OCUPADO = 'EMAIL_TAKEN'

/** Perfil de usuario guardado en Firestore (lo devuelve la API). */
export interface Perfil {
  uid: string
  username: string
  firstName: string
  lastName: string
  email: string
  avatar: string
}

/** Datos del formulario. Solo Firebase Authentication recibe email/contraseña. */
export interface CuerpoRegistro {
  firstName: string
  lastName: string
  username: string
  avatar: string
  email: string
  password: string
}

/** Perfil para POST /users/profile (el ID token va en la cabecera). */
export interface CuerpoCompletarGoogle {
  username: string
  nombres: string
  apellidos: string
  avatar: string
}

export function esRespuestaPerfil(valor: unknown): valor is { data: Perfil } {
  if (typeof valor !== 'object' || valor === null) return false
  const data = (valor as Record<string, unknown>).data
  if (typeof data !== 'object' || data === null) return false
  const perfil = data as Record<string, unknown>
  return ['uid', 'username', 'email', 'avatar'].every((campo) => typeof perfil[campo] === 'string') &&
    (typeof perfil.firstName === 'string' || typeof perfil.nombres === 'string') &&
    (typeof perfil.lastName === 'string' || typeof perfil.apellidos === 'string')
}

/** El backend desplegado utiliza nombres/apellidos; la interfaz conserva su modelo. */
export function normalizarPerfil(perfil: Perfil): Perfil {
  const datos = perfil as Perfil & { nombres?: string; apellidos?: string }
  return { ...perfil, firstName: datos.firstName ?? datos.nombres ?? '', lastName: datos.lastName ?? datos.apellidos ?? '' }
}
