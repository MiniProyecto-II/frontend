import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import EstadoCargando from '../components/EstadoCargando'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { ApiError } from '../services/api'
import { obtenerSalaPorId } from '../services/salasService'

interface ErroresFormulario {
  id?: string
  general?: string
}

function UnirseSala() {
  const { estado, perfil } = useAuth()
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [uniendo, setUniendo] = useState(false)
  const [errores, setErrores] = useState<ErroresFormulario>({})

  useTituloPagina(errores.id || errores.general ? 'No pudimos entrar a la sala' : 'Unirse a una sala')

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (uniendo) return
    const codigo = id.trim()
    if (!codigo) {
      setErrores({ id: 'Escribe el ID que te compartió el anfitrión.' })
      return
    }
    if (!/^[a-zA-Z0-9_-]{2,60}$/.test(codigo)) {
      setErrores({ id: 'El ID debe tener entre 2 y 60 caracteres: letras, números, guion o guion bajo.' })
      return
    }
    if (!perfil) {
      setErrores({ general: 'Inicia sesión para unirte a una sala.' })
      return
    }

    setUniendo(true)
    setErrores({})
    try {
      const sala = await obtenerSalaPorId(codigo, perfil.uid)
      if (!sala.id || sala.id !== codigo) {
        setErrores({ id: 'Sala no encontrada. Comprueba el ID con el anfitrión e inténtalo de nuevo.' })
        return
      }
      navigate(`/salas/${encodeURIComponent(sala.id)}`, {
        state: { salaRecienCreada: sala, esAnfitrion: sala.anfitrionUid === perfil.uid },
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setErrores({ id: 'Sala no encontrada. Comprueba el ID con el anfitrión e inténtalo de nuevo.' })
      } else {
        setErrores({ general: err instanceof Error ? err.message : 'No pudimos entrar a la sala. Inténtalo de nuevo.' })
      }
    } finally {
      setUniendo(false)
    }
  }

  if (estado === 'cargando') return <EstadoCargando />

  return (
    <section aria-labelledby="unirse-sala-titulo" className="flex w-full max-w-[700px] flex-col gap-8">
      <header className="flex flex-col gap-8">
        <h1 id="unirse-sala-titulo" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none sm:text-4xl">
          Unirse a una sala
        </h1>
        <p className="text-lg text-texto-suave">Pídele el ID al anfitrión de tu grupo.</p>
      </header>

      <form
        onSubmit={(evento) => { void manejarSubmit(evento) }}
        noValidate
        aria-busy={uniendo}
        className="flex flex-col gap-5 rounded-[20px] border border-borde bg-superficie p-6 sm:p-8"
      >
        <h2 className="text-2xl font-bold text-texto">Unirse a una sala</h2>
        <div className="sr-only" aria-live="assertive" aria-atomic="true">{errores.id}</div>
        {errores.general && <Alerta tipo="error">{errores.general}</Alerta>}
        <CampoTexto
          id="id-sala"
          valor={id}
          etiqueta="ID de la sala"
          autoComplete="off"
          onChange={(valor) => {
            setId(valor)
            setErrores({})
          }}
          error={errores.id}
          maxLength={60}
        />
        <Boton type="submit" cargando={uniendo}>
          {uniendo ? 'Uniéndome…' : 'Unirse a la sala'}
        </Boton>
        <div className="mt-1">
          <Boton to="/salas" variante="texto">Cancelar</Boton>
        </div>
      </form>
    </section>
  )
}

export default UnirseSala
