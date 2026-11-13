import { ApiError, peticion } from './api'
import {
  RUTA_COMPLETAR_GOOGLE,
  RUTA_MI_PERFIL,
  RUTA_REGISTRO,
  esRespuestaPerfil,
  type CuerpoCompletarGoogle,
  type CuerpoRegistro,
  type Perfil,
} from './contrato'

/** Crea la cuenta en el servidor (Firebase Auth + perfil en Firestore, con username único). */
export async function registrarUsuario(cuerpo: CuerpoRegistro, signal?: AbortSignal): Promise<void> {
  await peticion(RUTA_REGISTRO, { metodo: 'POST', cuerpo, signal })
}

/**
 * Perfil de la persona con sesión. Devuelve `null` si todavía no tiene perfil completo
 * (caso Google sin username: la API responde 403 o 404).
 */
export async function obtenerMiPerfil(signal?: AbortSignal): Promise<Perfil | null> {
  try {
    const respuesta = await peticion(RUTA_MI_PERFIL, { autenticada: true, signal })
    if (!esRespuestaPerfil(respuesta)) {
      throw new ApiError('La respuesta del servidor no tiene el formato esperado.')
    }
    return respuesta.data
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) return null
    throw err
  }
}

/** Termina el registro con Google guardando el username elegido. */
export async function completarPerfilGoogle(username: string, signal?: AbortSignal): Promise<void> {
  const cuerpo: CuerpoCompletarGoogle = { username }
  await peticion(RUTA_COMPLETAR_GOOGLE, { metodo: 'POST', cuerpo, autenticada: true, signal })
}
