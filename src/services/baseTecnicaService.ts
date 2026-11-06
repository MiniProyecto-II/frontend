import { ApiError, getJson } from './api'
import { RUTA_BASE_TECNICA, esRespuestaBaseTecnica, type BaseTecnica } from './contrato'

/** Pide el dato de la base técnica a la API y lo devuelve ya desenvuelto de `data`. */
export async function obtenerBaseTecnica(signal?: AbortSignal): Promise<BaseTecnica> {
  const respuesta = await getJson(RUTA_BASE_TECNICA, signal)
  if (!esRespuestaBaseTecnica(respuesta)) {
    throw new ApiError('La respuesta del servidor no tiene el formato esperado.')
  }
  return respuesta.data
}
