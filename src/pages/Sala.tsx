import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AvatarIniciales from '../components/AvatarIniciales'
import EstadoCargando from '../components/EstadoCargando'
import EstadoError from '../components/EstadoError'
import Boton from '../components/Boton'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import type { SalaEstudio } from '../services/contrato'
import { obtenerSalaPorId } from '../services/salasService'
import Alerta from '../components/Alerta'

interface EstadoSalaNav {
  salaRecienCreada?: SalaEstudio
  esAnfitrion?: boolean
  aviso?: string
}

function obtenerIniciales(nombres: string, apellidos: string): string {
  return `${nombres.trim().charAt(0)}${apellidos.trim().charAt(0)}`.toUpperCase() || 'TU'
}

function Sala() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const estadoNav = (useLocation().state ?? {}) as EstadoSalaNav

  const [sala, setSala] = useState<SalaEstudio | null>(estadoNav.salaRecienCreada ?? null)
  const [cargando, setCargando] = useState(!estadoNav.salaRecienCreada)
  const [error, setError] = useState<string | null>(null)
  const [idCopiado, setIdCopiado] = useState(false)
  const [pestanaMovil, setPestanaMovil] = useState<'sala' | 'chat'>('sala')

  // Estados locales de los controles multimedia
  const [microfonoActivo, setMicrofonoActivo] = useState(false)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [mensajeInput, setMensajeInput] = useState('')
  const [mensajesLocales, setMensajesLocales] = useState<Array<{ id: string; autor: string; hora: string; texto: string }>>([])

  const nombreSala = sala?.nombre ?? 'Sala de estudio'
  useTituloPagina(`${nombreSala} · Grupo de estudio`)

  useEffect(() => {
    if (estadoNav.salaRecienCreada || !perfil || !id) return
    const controller = new AbortController()
    setCargando(true)
    setError(null)

    obtenerSalaPorId(id, perfil.uid, controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) {
          setSala(datos)
          setCargando(false)
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar la sala.')
          setCargando(false)
        }
      })
    

    return () => controller.abort()
  }, [estadoNav.salaRecienCreada, id, perfil])

  async function copiarId() {
    if (!sala) return
    try {
      await navigator.clipboard.writeText(sala.id)
      setIdCopiado(true)
      setTimeout(() => setIdCopiado(false), 2500)
    } catch {
      // ignorar si el navegador bloquea el portapapeles
    }
  }

  function enviarMensajeLocal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const texto = mensajeInput.trim()
    if (!texto) return
    const ahora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    setMensajesLocales((prev) => [...prev, { id: String(Date.now()), autor: 'Tú', hora: ahora, texto }])
    setMensajeInput('')
  }

  if (cargando) return <EstadoCargando />

  if (error || !sala || !perfil) {
    return <EstadoError detalle={error ?? 'No encontramos esta sala.'} onReintentar={() => navigate('/salas')} />
  }

  const esAnfitrion = estadoNav.esAnfitrion ?? sala.esAnfitrion
  const inicialesUsuario = obtenerIniciales(perfil.firstName, perfil.lastName)
  const otrosParticipantes = sala.participantes.filter((p) => p.uid !== perfil.uid)
  const totalParticipantes = 1 + otrosParticipantes.length

  return (
    
    <section aria-labelledby="titulo-sala-activa" className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Cabecera superior con nombre, ID copiable y estado */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-borde pb-4">
        <div className="flex flex-col gap-1">
          <h1 id="titulo-sala-activa" tabIndex={-1} className="text-2xl font-bold tracking-tight text-texto outline-none">
            <span className="text-texto-suave"># </span>
            {sala.nombre} · Grupo de estudio
          </h1>
          {estadoNav.aviso && (
  <Alerta tipo="error">{estadoNav.aviso}</Alerta>
)}

          <div className="flex flex-wrap items-center gap-3 text-xs text-texto-suave">
            <span>
              ID: <strong className="font-mono text-texto">{sala.id}</strong>
            </span>
            <button
              type="button"
              onClick={() => void copiarId()}
              className="cursor-pointer rounded-md border border-borde bg-secundario px-2.5 py-1 font-semibold text-texto transition-colors hover:bg-superficie"
            >
              {idCopiado ? 'ID copiado ✓' : 'Copiar ID'}
            </button>
            {esAnfitrion && (
              <span className="rounded-full bg-acento/20 px-2.5 py-0.5 font-semibold text-acento">Anfitrión</span>
            )}
          </div>
        </div>

        <p className="text-sm font-medium text-exito">
          {totalParticipantes === 1 ? '1 participante' : `${totalParticipantes} participantes`}
        </p>
      </header>

      {/* Selector de pestañas solo en móvil (Sala / Chat) */}
      <div role="tablist" aria-label="Vistas de la sala" className="grid grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          role="tab"
          aria-selected={pestanaMovil === 'sala'}
          onClick={() => setPestanaMovil('sala')}
          className={`min-h-11 cursor-pointer rounded-lg font-semibold transition-colors ${
            pestanaMovil === 'sala' ? 'bg-acento text-white' : 'bg-superficie text-texto'
          }`}
        >
          Sala
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestanaMovil === 'chat'}
          onClick={() => setPestanaMovil('chat')}
          className={`min-h-11 cursor-pointer rounded-lg font-semibold transition-colors ${
            pestanaMovil === 'chat' ? 'bg-acento text-white' : 'bg-superficie text-texto'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Contenido principal: Cuadrícula de participantes + Chat lateral */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna izquierda (2/3): Participantes + Barra de controles */}
        <div className={`flex flex-col gap-5 lg:col-span-2 ${pestanaMovil === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Tarjeta del usuario actual (Anfitrión / Tú) */}
            <article className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-acento/50 bg-acento/15 p-6 text-center">
              <AvatarIniciales iniciales={inicialesUsuario} avatar={perfil.avatar} tamano="lg" />
              <p className="mt-1 font-bold text-texto">Tú · {perfil.firstName}</p>
              <p className="text-xs text-texto-suave">
                {microfonoActivo ? 'Micrófono activo' : 'Micrófono silenciado'}
              </p>
              <p className="text-xs text-texto-suave">{camaraActiva ? 'Cámara encendida' : 'Cámara apagada'}</p>
            </article>

            {/* Demás participantes o tarjeta de invitación */}
            {otrosParticipantes.length === 0 ? (
              <article className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center">
                <p className="font-semibold text-texto">Esperando a tu grupo</p>
                <p className="max-w-xs text-xs leading-relaxed text-texto-suave">
                  Comparte el ID <span className="font-mono font-semibold text-texto">{sala.id}</span> para que tus
                  compañeros se unan.
                </p>
              </article>
            ) : (
              otrosParticipantes.map((p) => (
                <article
                  key={p.uid || p.username}
                  className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-borde bg-superficie p-6 text-center"
                >
                  <AvatarIniciales iniciales={p.iniciales} avatar={p.avatar} tamano="lg" />
                  <p className="mt-1 font-bold text-texto">{p.username}</p>
                  <p className="text-xs text-texto-suave">Micrófono silenciado</p>
                </article>
              ))
            )}
          </div>

          {/* Barra inferior de controles */}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
            <button
              type="button"
              onClick={() => setMicrofonoActivo((v) => !v)}
              aria-pressed={microfonoActivo}
              className="min-h-11 cursor-pointer rounded-lg bg-secundario px-4 py-2 text-sm font-semibold text-texto transition-colors hover:bg-borde"
            >
              {microfonoActivo ? 'Silenciar mic.' : 'Activar mic.'}
            </button>

            <button
              type="button"
              onClick={() => setCamaraActiva((v) => !v)}
              aria-pressed={camaraActiva}
              className="min-h-11 cursor-pointer rounded-lg bg-secundario px-4 py-2 text-sm font-semibold text-texto transition-colors hover:bg-borde"
            >
              {camaraActiva ? 'Apagar cámara' : 'Encender cámara'}
            </button>

            <Boton to="/salas" variante="peligro" ancho="auto">
              Salir
            </Boton>
          </div>
        </div>

        {/* Columna derecha (1/3): Chat de estudio */}
        <aside
          aria-label="Chat de estudio"
          className={`flex flex-col justify-between gap-4 rounded-2xl border border-borde bg-superficie p-5 ${
            pestanaMovil === 'sala' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex flex-col gap-3">
            <h2 className="border-b border-borde pb-3 text-lg font-bold text-texto">
              <span className="text-texto-suave"># </span>chat de estudio
            </h2>

            <div className="flex min-h-48 flex-col gap-3 overflow-y-auto py-2">
              {mensajesLocales.length === 0 ? (
                <p className="text-xs text-texto-suave">
                  Aún no hay mensajes en esta sesión. Escribe para saludar a tu grupo.
                </p>
              ) : (
                mensajesLocales.map((m) => (
                  <div key={m.id} className="flex flex-col gap-0.5 text-sm">
                    <span className="text-xs font-semibold text-exito">
                      {m.autor} · {m.hora}
                    </span>
                    <p className="text-texto">{m.texto}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={enviarMensajeLocal} className="flex flex-col gap-2 border-t border-borde pt-3">
            <label htmlFor="mensaje-sala" className="text-xs font-semibold tracking-wider text-texto-suave uppercase">
              Mensaje
            </label>
            <input
              id="mensaje-sala"
              type="text"
              value={mensajeInput}
              onChange={(e) => setMensajeInput(e.target.value)}
              placeholder="Escribe a tu grupo..."
              className="min-h-11 rounded-lg border border-borde bg-fondo px-3 text-sm text-texto placeholder:text-texto-suave focus:border-acento focus:outline-none"
            />
            <button
              type="submit"
              disabled={!mensajeInput.trim()}
              className="min-h-11 cursor-pointer rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-acento/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar mensaje
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}

export default Sala