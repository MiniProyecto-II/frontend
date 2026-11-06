const TIMEOUT_MS = 10_000

/** Error con mensaje comprensible para mostrar al usuario. */
export class ApiError extends Error {
  readonly status?: number

  constructor(mensaje: string, status?: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
  }
}

function obtenerUrlBase(): string {
  const base = import.meta.env.VITE_API_URL?.trim()
  if (!base) {
    throw new ApiError(
      'Falta configurar la variable VITE_API_URL con la URL de la API.',
    )
  }

  let url: URL
  try {
    url = new URL(base)
  } catch {
    throw new ApiError(`VITE_API_URL no es una URL válida: "${base}".`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ApiError('VITE_API_URL debe empezar por http:// o https://.')
  }

  return base.replace(/\/+$/, '')
}

function construirUrl(ruta: string): string {
  return `${obtenerUrlBase()}/${ruta.replace(/^\/+/, '')}`
}

/**
 * Hace una petición GET a la API y devuelve el JSON.
 * - Timeout de 10 s.
 * - Si se pasa `signal` y se aborta (p. ej. al desmontar), se relanza el AbortError
 *   para que quien llama pueda ignorarlo.
 */
export async function getJson(ruta: string, signal?: AbortSignal): Promise<unknown> {
  const url = construirUrl(ruta)

  const controller = new AbortController()
  let porTimeout = false
  const timer = setTimeout(() => {
    porTimeout = true
    controller.abort()
  }, TIMEOUT_MS)

  const alCancelar = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', alCancelar, { once: true })

  try {
    let respuesta: Response
    try {
      respuesta = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      })
    } catch (err) {
      if (porTimeout) {
        throw new ApiError(
          'La API tardó demasiado en responder (más de 10 segundos).',
        )
      }
      if (signal?.aborted) throw err
      throw new ApiError(
        'No se pudo conectar con la API. Revisa tu conexión o inténtalo más tarde.',
      )
    }

    if (!respuesta.ok) {
      throw new ApiError(
        `La API respondió con un error (código ${respuesta.status}).`,
        respuesta.status,
      )
    }

    try {
      return await respuesta.json()
    } catch (err) {
      if (signal?.aborted) throw err
      throw new ApiError('La respuesta de la API no es un JSON válido.')
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', alCancelar)
  }
}
