import { ApiError, peticion } from './api'
import { RUTA_SALAS, type CuerpoCrearSala, type SalaEstudio } from './contrato'

const STORAGE_MOCK_SALAS = 'salon_estudio_mock_salas_v1'

function leerSalasMock(uidUsuario: string): SalaEstudio[] {
  try {
    const raw = localStorage.getItem(STORAGE_MOCK_SALAS)
    if (!raw) return []
    const todas = JSON.parse(raw) as SalaEstudio[]
    return todas.filter((s) => s.anfitrionUid === uidUsuario)
  } catch {
    return []
  }
}

function guardarSalasMock(salas: SalaEstudio[]) {
  try {
    localStorage.setItem(STORAGE_MOCK_SALAS, JSON.stringify(salas))
  } catch {
    // ignorar si el almacenamiento está bloqueado
  }
}

function generarCodigoSala(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const prefijo = Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join('')
  const numero = Math.floor(1000 + Math.random() * 9000)
  return `${prefijo}-${numero}`
}

function normalizarSala(raw: unknown, uidUsuario: string): SalaEstudio {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const id = String(r.id ?? r.roomId ?? r.codigo ?? '')
  const nombre = String(r.nombre ?? r.name ?? 'Sala sin nombre')
  const anfitrionUid = String(r.anfitrionUid ?? r.ownerId ?? r.hostId ?? uidUsuario)
  const participantesRaw = Array.isArray(r.participantes) ? r.participantes : []

  return {
    id,
    nombre,
    anfitrionUid,
    esAnfitrion: anfitrionUid === uidUsuario,
    participantes: participantesRaw.map((p) => {
      const item = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>
      const username = String(item.username ?? 'usuario')
      return {
        uid: String(item.uid ?? ''),
        username,
        iniciales: String(item.iniciales ?? username.slice(0, 2).toUpperCase()),
        avatar: typeof item.avatar === 'string' ? item.avatar : undefined,
      }
    }),
  }
}

/** Lista las salas del usuario autenticado (US-06). */
export async function listarMisSalas(uidUsuario: string, signal?: AbortSignal): Promise<SalaEstudio[]> {
  if (import.meta.env.VITE_USAR_MOCKS === 'true') {
    await new Promise((r) => setTimeout(r, 350))
    return leerSalasMock(uidUsuario)
  }

  const respuesta = await peticion(RUTA_SALAS, { autenticada: true, signal })
  const data = (typeof respuesta === 'object' && respuesta !== null
    ? (respuesta as Record<string, unknown>).data
    : respuesta) as unknown

  if (!Array.isArray(data)) return []
  return data.map((item) => normalizarSala(item, uidUsuario))
}

/** Crea una nueva sala de estudio y devuelve la sala creada (US-06). */
export async function crearSalaEstudio(
  cuerpo: CuerpoCrearSala,
  usuario: { uid: string; username: string; iniciales: string; avatar?: string },
  signal?: AbortSignal,
): Promise<SalaEstudio> {
  const nombreLimpio = cuerpo.nombre.trim()
  if (!nombreLimpio) {
    throw new ApiError('Escribe un nombre para crear la sala.', 400, 'INVALID_ROOM_NAME')
  }

  if (import.meta.env.VITE_USAR_MOCKS === 'true') {
    await new Promise((r) => setTimeout(r, 400))
    const nueva: SalaEstudio = {
      id: generarCodigoSala(),
      nombre: nombreLimpio,
      anfitrionUid: usuario.uid,
      esAnfitrion: true,
      participantes: [
        {
          uid: usuario.uid,
          username: usuario.username,
          iniciales: usuario.iniciales,
          avatar: usuario.avatar,
        },
      ],
    }
    const existentes = leerSalasMock(usuario.uid)
    guardarSalasMock([nueva, ...existentes])
    return nueva
  }

  const respuesta = await peticion(RUTA_SALAS, {
    metodo: 'POST',
    autenticada: true,
    signal,
    cuerpo: { nombre: nombreLimpio, name: nombreLimpio },
  })

  const data =
    typeof respuesta === 'object' && respuesta !== null && 'data' in respuesta
      ? (respuesta as Record<string, unknown>).data
      : respuesta

  return normalizarSala(data, usuario.uid)
}