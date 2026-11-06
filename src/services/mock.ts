// TEMPORAL: eliminar cuando BE publique la API
import type { BaseTecnica } from './contrato'

const RETRASO_MS = 800

/** Devuelve un dato de ejemplo tras 800 ms. Solo se usa en desarrollo con VITE_USE_MOCK=true. */
export function obtenerBaseTecnicaMock(signal?: AbortSignal): Promise<BaseTecnica> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve({
        mensaje: 'Dato de ejemplo (mock): la base técnica funciona.',
        actualizadoEn: new Date().toISOString(),
      })
    }, RETRASO_MS)

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Petición cancelada', 'AbortError'))
      },
      { once: true },
    )
  })
}
