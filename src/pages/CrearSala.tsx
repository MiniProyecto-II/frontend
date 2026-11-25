import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { crearSalaEstudio } from '../services/salasService'

function obtenerIniciales(nombres: string, apellidos: string): string {
  const n = nombres.trim().charAt(0)
  const a = apellidos.trim().charAt(0)
  return `${n}${a}`.toUpperCase() || 'US'
}

function CrearSala() {
  const navigate = useNavigate()
  const { perfil } = useAuth()

  const [nombre, setNombre] = useState('')
  const [errorNombre, setErrorNombre] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)

  const hayError = Boolean(errorNombre || errorGeneral)
  const tituloActual = hayError ? 'Tu sala necesita un nombre' : 'Crear una sala'
  useTituloPagina(tituloActual)

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!perfil || creando) return

    const limpio = nombre.trim()
    if (limpio.length === 0) {
      setErrorNombre('Escribe un nombre para crear la sala.')
      return
    }
    if (limpio.length < 3) {
      setErrorNombre('El nombre de la sala debe tener al menos 3 caracteres.')
      return
    }

    setCreando(true)
    setErrorNombre(null)
    setErrorGeneral(null)

    try {
      const salaCreada = await crearSalaEstudio(
        { nombre: limpio },
        {
          uid: perfil.uid,
          username: perfil.username,
          iniciales: obtenerIniciales(perfil.firstName, perfil.lastName),
          avatar: perfil.avatar,
        },
      )
      // Entra automáticamente a la sala recién creada como anfitrión (S2-C04)
      navigate(`/salas/${encodeURIComponent(salaCreada.id)}`, {
        replace: true,
        state: { salaRecienCreada: salaCreada, esAnfitrion: true },
      })
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : 'No pudimos crear la sala. Inténtalo de nuevo.')
      setCreando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-crear-sala" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 id="titulo-crear-sala" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          {tituloActual}
        </h1>
        {!hayError && <p className="text-texto-suave">Dale a tu grupo un espacio propio.</p>}
      </header>

      <form
        onSubmit={(e) => {
          void manejarSubmit(e)
        }}
        noValidate
        className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold text-texto">{hayError ? 'Revisa este campo' : 'Crear una sala'}</h2>

        {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}

        <CampoTexto
          id="nombre-sala"
          etiqueta="Nombre de la sala"
          valor={nombre}
          onChange={(v) => {
            setNombre(v)
            if (errorNombre) setErrorNombre(null)
          }}
          error={errorNombre}
          maxLength={60}
        />

        <div className="mt-1 flex flex-col gap-3">
          <Boton type="submit" variante="primario" cargando={creando}>
            {hayError ? 'Corregir' : 'Crear sala y entrar'}
          </Boton>
          <Boton to="/salas" variante="texto">
            {hayError ? 'Volver a Mis salas' : 'Cancelar'}
          </Boton>
        </div>
      </form>
    </section>
  )
}

export default CrearSala