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
  const id = String(r.id ?? r.roomId ?? '')
  const nombre = String(r.name ?? r.nombre ?? 'Sala sin nombre')
  const anfitrionUid = String(r.ownerUid ?? r.anfitrionUid ?? uidUsuario)
  const anfitrionUsername = String(r.ownerUsername ?? r.anfitrionUsername ?? 'anfitrion')
  const participantesRaw = Array.isArray(r.participantes) ? r.participantes : []

  const participantes =
    participantesRaw.length > 0
      ? participantesRaw.map((p) => {
          const item = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>
          const username = String(item.username ?? 'usuario')
          return {
            uid: String(item.uid ?? ''),
            username,
            iniciales: String(item.iniciales ?? username.slice(0, 2).toUpperCase()),
            avatar: typeof item.avatar === 'string' ? item.avatar : undefined,
          }
        })
      : [
          {
            uid: anfitrionUid,
            username: anfitrionUsername,
            iniciales: anfitrionUsername.slice(0, 2).toUpperCase() || 'AN',
          },
        ]

  return {
    id,
    nombre,
    anfitrionUid,
    anfitrionUsername,
    esAnfitrion: anfitrionUid === uidUsuario,
    participantes,
  }
}

/** Lista las salas del usuario autenticado (US-06 · GET /api/v1/rooms). */
export async function listarMisSalas(uidUsuario: string, signal?: AbortSignal): Promise<SalaEstudio[]> {
  if (import.meta.env.VITE_USAR_MOCKS === 'true') {
    await new Promise((r) => setTimeout(r, 350))
    return leerSalasMock(uidUsuario)
  }

  const respuesta = await peticion(RUTA_SALAS, { autenticada: true, signal })

  // Swagger confirma que GET /api/v1/rooms devuelve el array directamente (y soportamos { data: [...] } por si acaso)
  const lista = Array.isArray(respuesta)
    ? respuesta
    : typeof respuesta === 'object' && respuesta !== null && Array.isArray((respuesta as Record<string, unknown>).data)
      ? ((respuesta as Record<string, unknown>).data as unknown[])
      : []

  return lista.map((item) => normalizarSala(item, uidUsuario))
}

/** Crea una nueva sala de estudio (US-06 · POST /api/v1/rooms). */
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
      anfitrionUsername: usuario.username,
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

  // Swagger exige exactamente: { name, ownerUid, ownerUsername }
  const respuesta = await peticion(RUTA_SALAS, {
    metodo: 'POST',
    autenticada: true,
    signal,
    cuerpo: {
      name: nombreLimpio,
      ownerUid: usuario.uid,
      ownerUsername: usuario.username,
    },
  })

  const data =
    typeof respuesta === 'object' && respuesta !== null && 'data' in respuesta
      ? (respuesta as Record<string, unknown>).data
      : respuesta

  return normalizarSala(data, usuario.uid)
}