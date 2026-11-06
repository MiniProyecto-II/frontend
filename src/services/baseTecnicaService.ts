import { ApiError, getJson } from './api'
import { RUTA_BASE_TECNICA, esBaseTecnica, type BaseTecnica } from './contrato'

// El mock solo existe en desarrollo (`npm run dev`) y solo si VITE_USE_MOCK=true.
// En el build de producción `import.meta.env.DEV` es false y el mock ni siquiera se incluye.
const usarMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

export async function obtenerBaseTecnica(signal?: AbortSignal): Promise<BaseTecnica> {
  if (usarMock) {
    const { obtenerBaseTecnicaMock } = await import('./mock')
    return obtenerBaseTecnicaMock(signal)
  }

  const datos = await getJson(RUTA_BASE_TECNICA, signal)
  if (!esBaseTecnica(datos)) {
    throw new ApiError('La respuesta de la API no tiene el formato esperado.')
  }
  return datos
}
