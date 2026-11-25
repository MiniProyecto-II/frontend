import { useCallback, useEffect, useState } from 'react'
import AvatarIniciales from '../components/AvatarIniciales'
import Boton from '../components/Boton'
import EstadoCargando from '../components/EstadoCargando'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import type { SalaEstudio } from '../services/contrato'
import { listarMisSalas } from '../services/salasService'

function MisSalas() {
  const { perfil } = useAuth()

  const [salas, setSalas] = useState<SalaEstudio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idCopiado, setIdCopiado] = useState<string | null>(null)
  const [anuncioLector, setAnuncioLector] = useState('')

  const sinSalas = !cargando && !error && salas.length === 0
  const tituloActual = error
    ? 'No pudimos cargar las salas'
    : sinSalas
      ? 'Aquí empieza tu próximo grupo'
      : 'Mis salas'

  useTituloPagina(tituloActual)

  const cargarSalas = useCallback(
    async (signal?: AbortSignal) => {
      if (!perfil) return
      setCargando(true)
      setError(null)
      try {
        const lista = await listarMisSalas(perfil.uid, signal)
        if (!signal?.aborted) setSalas(lista)
      } catch (err) {
        if (!signal?.aborted) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar tus salas.')
        }
      } finally {
        if (!signal?.aborted) setCargando(false)
      }
    },
    [perfil],
  )

  useEffect(() => {
    const controller = new AbortController()
    void cargarSalas(controller.signal)
    return () => controller.abort()
  }, [cargarSalas])

  async function copiarIdSala(sala: SalaEstudio) {
    try {
      await navigator.clipboard.writeText(sala.id)
      setIdCopiado(sala.id)
      setAnuncioLector(`ID ${sala.id} de la sala ${sala.nombre} copiado al portapapeles.`)
      setTimeout(() => {
        setIdCopiado((actual) => (actual === sala.id ? null : actual))
      }, 2500)
    } catch {
      setAnuncioLector('No se pudo copiar el ID automáticamente.')
    }
  }

  if (cargando) {
    return (
      <section aria-labelledby="titulo-mis-salas" className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <h1 id="titulo-mis-salas" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          Mis salas
        </h1>
        <EstadoCargando />
      </section>
    )
  }

  // Estado de error fiel a Figma (D · T1 - No pudimos cargar las salas)
  if (error) {
    return (
      <section aria-labelledby="titulo-error-salas" className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <h1 id="titulo-error-salas" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          No pudimos cargar las salas
        </h1>

        <div
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
        >
          <h2 className="text-lg font-bold text-texto">No pudimos cargar las salas</h2>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-texto-suave"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>

          <p className="text-sm text-texto-suave">Comprueba tu conexión y vuelve a intentarlo.</p>

          <div className="mt-1 flex flex-col gap-3">
            <Boton
              variante="primario"
              onClick={() => {
                void cargarSalas()
              }}
            >
              Reintentar
            </Boton>
            <Boton
              variante="texto"
              onClick={() => {
                setError(null)
              }}
            >
              Volver a Mis salas
            </Boton>
          </div>
        </div>
      </section>
    )
  }

  // Estado vacío fiel a Figma (D · T1 - Aquí empieza tu próximo grupo)
  if (salas.length === 0) {
    return (
      <section aria-labelledby="titulo-sin-salas" className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <h1 id="titulo-sin-salas" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          Aquí empieza tu próximo grupo
        </h1>

        <div
          aria-live="polite"
          className="flex flex-col gap-4 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
        >
          <h2 className="text-lg font-bold text-texto">Aquí empieza tu próximo grupo</h2>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-6 text-acento"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>

          <p className="text-sm text-texto-suave">Todavía no has creado ninguna sala.</p>

          <div className="mt-1 flex flex-col gap-3">
            <Boton to="/salas/crear" variante="primario">
              Crear mi primera sala
            </Boton>
            <Boton to="/salas/unirse" variante="secundario">
              Unirse con un ID
            </Boton>
          </div>
        </div>
      </section>
    )
  }

  // Estado con salas fiel a Figma (D · T1 - Mis salas)
  return (
    <section aria-labelledby="titulo-mis-salas" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 id="titulo-mis-salas" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          Mis salas
        </h1>
        <p className="text-texto-suave">Un lugar para cada grupo. Retoma una sala o crea algo nuevo.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Boton to="/salas/crear" variante="primario" ancho="auto">
          + Crear sala
        </Boton>
        <Boton to="/salas/unirse" variante="secundario" ancho="auto">
          Unirse con un ID
        </Boton>
      </div>

      <hr className="border-borde" />

      {/* Región viva para lectores de pantalla (NVDA / VoiceOver) al copiar ID */}
      <p role="status" aria-live="polite" className="sr-only">
        {anuncioLector}
      </p>

      <div className="flex flex-col gap-4">
        {salas.map((sala) => {
          const copiado = idCopiado === sala.id
          const cantidad = sala.participantes.length || 1
          return (
            <article
              key={sala.id}
              aria-label={`Sala ${sala.nombre}`}
              className="flex flex-col gap-4 rounded-2xl border border-borde bg-superficie p-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-texto">{sala.nombre} · Grupo de estudio</h2>
                <p className="text-sm text-texto-suave">
                  ID: <span className="font-mono font-semibold text-texto">{sala.id}</span> ·{' '}
                  {sala.esAnfitrion ? 'Creada por ti' : 'Participante'}
                </p>
              </div>

              {sala.participantes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {sala.participantes.map((p) => (
                    <AvatarIniciales key={p.uid || p.username} iniciales={p.iniciales} avatar={p.avatar} tamano="md" />
                  ))}
                </div>
              )}

              <p className="text-sm font-medium text-exito">
                {cantidad === 1 ? '1 compañero listo para estudiar' : `${cantidad} compañeros listos para estudiar`}
              </p>

              <Boton to={`/salas/${encodeURIComponent(sala.id)}`} variante="primario">
                Entrar a la sala
              </Boton>

              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    void copiarIdSala(sala)
                  }}
                  aria-label={`Copiar ID de la sala ${sala.nombre}`}
                  className="min-h-11 cursor-pointer rounded-lg px-4 py-2 text-center text-sm font-semibold text-texto transition-colors duration-150 hover:bg-secundario"
                >
                  {copiado ? 'ID copiado ✓' : 'Copiar ID'}
                </button>

                {sala.esAnfitrion && (
                  <>
                    <Boton to={`/salas/${encodeURIComponent(sala.id)}/editar`} variante="texto">
                      Editar
                    </Boton>
                    <Boton to={`/salas/${encodeURIComponent(sala.id)}/eliminar`} variante="texto">
                      Eliminar
                    </Boton>
                  </>
                )}
              </div>
            </article>
          )
        })}

        <p className="text-xs text-texto-suave">Solo tú puedes editar o eliminar las salas que creas.</p>
      </div>
    </section>
  )
}

export default MisSalas