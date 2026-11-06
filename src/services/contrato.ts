// PENDIENTE: confirmar ruta y forma del JSON con BE

/** Ruta del endpoint que devuelve el dato de la base técnica (leído de Firestore por la API). */
export const RUTA_BASE_TECNICA = '/api/base-tecnica'

/** Forma de la respuesta del endpoint. */
export interface BaseTecnica {
  mensaje: string
  actualizadoEn: string
}

/** Comprueba en tiempo de ejecución que la respuesta tiene la forma esperada. */
export function esBaseTecnica(valor: unknown): valor is BaseTecnica {
  if (typeof valor !== 'object' || valor === null) return false
  const v = valor as Record<string, unknown>
  return typeof v.mensaje === 'string' && typeof v.actualizadoEn === 'string'
}
