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
