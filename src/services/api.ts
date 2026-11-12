import { auth } from './firebase'

// 60 s: el plan gratuito de Render duerme el servidor y la primera petición puede tardar cerca de un minuto.
const TIMEOUT_MS = 60_000

/** Error con mensaje comprensible para mostrar al usuario. */
export class ApiError extends Error {
  readonly status?: number
  /** Código de error de la API (p. ej. USERNAME_TAKEN), si lo envía. */
  readonly codigo?: string
  /** Errores por campo que devuelve la API en validaciones (campo → mensaje). */
  readonly campos?: Record<string, string>

  constructor(mensaje: string, status?: number, codigo?: string, campos?: Record<string, string>) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.campos = campos
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

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  cuerpo?: unknown
  signal?: AbortSignal
  /** Si es true, envía el ID Token de Firebase en la cabecera Authorization. */
  autenticada?: boolean
}

/** Obtiene el ID Token vigente de la sesión (Firebase lo renueva solo cuando caduca). */
async function obtenerToken(forzar = false): Promise<string | null> {
  const usuario = auth?.currentUser
  if (!usuario) return null
  return usuario.getIdToken(forzar)
}

function leerErrorApi(cuerpo: unknown): { codigo?: string; mensaje?: string; campos?: Record<string, string> } {
  if (typeof cuerpo !== 'object' || cuerpo === null) return {}
  const error = (cuerpo as Record<string, unknown>).error
  if (typeof error !== 'object' || error === null) return {}
  const { code, message, fields } = error as Record<string, unknown>
  const campos: Record<string, string> = {}
  if (typeof fields === 'object' && fields !== null) {
    for (const [clave, valor] of Object.entries(fields)) {
      if (typeof valor === 'string') campos[clave] = valor
    }
  }
  return {
    codigo: typeof code === 'string' ? code : undefined,
    mensaje: typeof message === 'string' ? message : undefined,
    campos: Object.keys(campos).length > 0 ? campos : undefined,
  }
}

/**
 * Cliente base de la API.
 * - Timeout de 60 s.
 * - Interceptor: con `autenticada` agrega `Authorization: Bearer <ID Token>`. Si la API responde 401,
 *   renueva el token una vez y reintenta; si sigue en 401 lanza un ApiError con status 401.
 * - Si se pasa `signal` y se aborta (p. ej. al desmontar), se relanza el AbortError.
 */
export async function peticion(ruta: string, opciones: OpcionesPeticion = {}): Promise<unknown> {
  const { metodo = 'GET', cuerpo, signal, autenticada = false } = opciones
  const url = construirUrl(ruta)

  const enviar = async (forzarToken: boolean): Promise<Response> => {
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
      const cabeceras: Record<string, string> = { Accept: 'application/json' }
      if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
      if (autenticada) {
        const token = await obtenerToken(forzarToken)
        if (!token) throw new ApiError('Tu sesión terminó. Inicia sesión de nuevo.', 401)
        cabeceras.Authorization = `Bearer ${token}`
      }

      return await fetch(url, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        cache: 'no-store',
        signal: controller.signal,
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      if (porTimeout) {
        throw new ApiError(
          'El servidor tardó demasiado en responder. Puede estar despertando: inténtalo de nuevo en un momento.',
        )
      }
      if (signal?.aborted) throw err
      throw new ApiError(
        'No hay conexión con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.',
      )
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', alCancelar)
    }
  }

  let respuesta = await enviar(false)
  if (respuesta.status === 401 && autenticada) respuesta = await enviar(true)

  let json: unknown = null
  try {
    json = await respuesta.json()
  } catch (err) {
    if (signal?.aborted) throw err
    if (respuesta.ok) throw new ApiError('La respuesta del servidor no tiene el formato esperado.')
  }

  if (!respuesta.ok) {
    const detalle = leerErrorApi(json)
    const generico =
      respuesta.status >= 500
        ? 'El servidor tuvo un problema al responder. Inténtalo de nuevo en unos minutos.'
        : 'El servidor no pudo entregar la información solicitada.'
    throw new ApiError(detalle.mensaje ?? generico, respuesta.status, detalle.codigo, detalle.campos)
  }

  return json
}

/** Petición GET pública (la usa la base técnica). */
export function getJson(ruta: string, signal?: AbortSignal): Promise<unknown> {
  return peticion(ruta, { signal })
}
