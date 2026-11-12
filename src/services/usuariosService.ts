import { ApiError, peticion } from './api'
import {
  RUTA_MI_PERFIL,
  esRespuestaPerfil,
  type Perfil,
} from './contrato'

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
