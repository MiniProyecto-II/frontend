import { useCallback, useEffect, useState } from 'react'
import AvatarIniciales from '../components/AvatarIniciales'
import Boton from '../components/Boton'
import EstadoCargando from '../components/EstadoCargando'
import EstadoError from '../components/EstadoError'
import TarjetaEstado from '../components/TarjetaEstado'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import type { SalaEstudio } from '../services/contrato'
import { listarMisSalas } from '../services/salasService'

const TITULO = 'Mis salas'

function MisSalas() {
  useTituloPagina(TITULO)
  const { perfil } = useAuth()

  const [salas, setSalas] = useState<SalaEstudio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idCopiado, setIdCopiado] = useState<string | null>(null)
  const [anuncioLector, setAnuncioLector] = useState('')

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

  return (
    <section aria-labelledby="titulo-mis-salas" className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 id="titulo-mis-salas" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          {TITULO}
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

      {cargando ? (
        <EstadoCargando />
      ) : error ? (
        <EstadoError
          detalle={error}
          onReintentar={() => {
            void cargarSalas()
          }}
        />
      ) : salas.length === 0 ? (
        <TarjetaEstado aria-live="polite">
          <h2 className="text-lg font-bold text-texto">Aún no tienes salas de estudio</h2>
          <p className="text-texto-suave">
            Crea tu primera sala para invitar a tus compañeros con un ID único o únete a una existente.
          </p>
          <div className="mt-2">
            <Boton to="/salas/crear" variante="primario" ancho="auto">
              Crear mi primera sala
            </Boton>
          </div>
        </TarjetaEstado>
      ) : (
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
                  <h2 className="text-xl font-bold text-texto">{sala.nombre}</h2>
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
                      <Boton to={`/salas/${encodeURIComponent(sala.id)}/editar`} variante="texto">
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
      )}
    </section>
  )
}

export default MisSalas