import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import EstadoCargando from '../components/EstadoCargando'
import EstadoError from '../components/EstadoError'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import type { SalaEstudio } from '../services/contrato'
import { eliminarSalaEstudio, obtenerSalaPorId } from '../services/salasService'

interface EstadoUbicacion {
  sala?: SalaEstudio
}

function EliminarSala() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const estadoNav = (useLocation().state ?? {}) as EstadoUbicacion

  const [sala, setSala] = useState<SalaEstudio | null>(estadoNav.sala ?? null)
  const [cargando, setCargando] = useState(!estadoNav.sala)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [eliminada, setEliminada] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  useTituloPagina(eliminada ? 'La sala fue eliminada' : 'Eliminar sala')

  useEffect(() => {
    if (estadoNav.sala || !perfil || !id) return
    const controller = new AbortController()
    setCargando(true)
    setErrorCarga(null)

    obtenerSalaPorId(id, perfil.uid, controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) {
          setSala(datos)
          setCargando(false)
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setErrorCarga(err instanceof Error ? err.message : 'No pudimos cargar la sala.')
          setCargando(false)
        }
      })

    return () => controller.abort()
  }, [estadoNav.sala, id, perfil])

  // Tecla Escape cancela y vuelve a Mis salas
  useEffect(() => {
    const manejarEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !eliminando && !eliminada) {
        e.preventDefault()
        navigate('/salas')
      }
    }
    window.addEventListener('keydown', manejarEsc)
    return () => window.removeEventListener('keydown', manejarEsc)
  }, [eliminando, eliminada, navigate])

  async function confirmarEliminacion() {
    if (!perfil || !id || eliminando) return
    setEliminando(true)
    setErrorEliminar(null)
    try {
      await eliminarSalaEstudio(id, perfil.uid)
      setEliminada(true)
    } catch (err) {
      setErrorEliminar(err instanceof Error ? err.message : 'No pudimos eliminar la sala. Inténtalo de nuevo.')
      setEliminando(false)
    }
  }

  if (eliminada) {
    return (
      <section aria-labelledby="titulo-sala-eliminada" className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <h1
          id="titulo-sala-eliminada"
          tabIndex={-1}
          className="text-3xl font-bold tracking-tight text-texto outline-none"
        >
          La sala fue eliminada
        </h1>

        <Alerta tipo="aviso">El anfitrión eliminó esta sala. Todos los participantes han vuelto a Mis salas.</Alerta>

        <Boton to="/salas" variante="primario">
          Volver a Mis salas
        </Boton>
      </section>
    )
  }

  if (cargando) return <EstadoCargando />

  if (errorCarga || !sala) {
    return (
      <EstadoError
        detalle={errorCarga ?? 'No encontramos la sala que intentas eliminar.'}
        onReintentar={() => navigate('/salas')}
      />
    )
  }

  const totalParticipantes = sala.participantes.length || 1

  return (
    <section aria-labelledby="titulo-eliminar-sala" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1 id="titulo-eliminar-sala" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
        Eliminar sala
      </h1>

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="subtitulo-confirmar-sala"
        aria-describedby="descripcion-eliminar-sala"
        className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
      >
        <h2 id="subtitulo-confirmar-sala" className="text-xl font-bold text-texto">
          ¿Eliminar {sala.nombre}?
        </h2>

        <div className="rounded-lg border border-error/40 bg-error-tenue px-4 py-3 text-sm text-error">
          Esta acción no se puede deshacer.
        </div>

        <p id="descripcion-eliminar-sala" className="text-sm leading-relaxed text-texto-suave">
          Se eliminarán la sala y su historial.{' '}
          {totalParticipantes === 1
            ? 'Los participantes recibirán un aviso y volverán a Mis salas.'
            : `Los ${totalParticipantes} participantes recibirán un aviso y volverán a Mis salas.`}
        </p>

        {errorEliminar && <Alerta tipo="error">{errorEliminar}</Alerta>}

        <div className="mt-1 flex flex-col gap-3">
          <Boton to="/salas" variante="secundario">
            Cancelar
          </Boton>

          <Boton
            variante="peligro"
            cargando={eliminando}
            onClick={() => {
                void confirmarEliminacion()
            }}
            >
            {eliminando ? 'Eliminando sala…' : 'Eliminar sala'}
            </Boton>
        </div>
      </div>
    </section>
  )
}

export default EliminarSala