import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Eliminar cuenta'

function EliminarCuenta() {
  useTituloPagina(TITULO)
  const navigate = useNavigate()
  const { eliminarCuenta } = useAuth()

  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)

  // WCAG 2.2 (S2-C09): cerrar/cancelar confirmación con la tecla Escape y atrapar foco en las acciones
  useEffect(() => {
    const manejarTeclado = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !eliminando) {
        evento.preventDefault()
        navigate('/perfil')
      }
      if (evento.key === 'Tab' && contenedorRef.current) {
        const enfocables = contenedorRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (enfocables.length === 0) return
        const primero = enfocables[0]
        const ultimo = enfocables[enfocables.length - 1]
        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault()
          ultimo.focus()
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault()
          primero.focus()
        }
      }
    }

    window.addEventListener('keydown', manejarTeclado)
    return () => window.removeEventListener('keydown', manejarTeclado)
  }, [eliminando, navigate])

  async function confirmarEliminacion() {
    if (eliminando) return
    setEliminando(true)
    setError(null)
    try {
      await eliminarCuenta()
      // RutaPrivada redirige automáticamente a /ingreso con state: { cuentaEliminada: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos eliminar tu cuenta. Inténtalo de nuevo.')
      setEliminando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-eliminar-cuenta" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1
        id="titulo-eliminar-cuenta"
        tabIndex={-1}
        className="text-3xl font-bold tracking-tight text-texto outline-none"
      >
        {TITULO}
      </h1>

      <div
        ref={contenedorRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="subtitulo-confirmar-eliminacion"
        aria-describedby="descripcion-eliminar-cuenta"
        className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
      >
        <h2 id="subtitulo-confirmar-eliminacion" className="text-xl font-bold text-texto">
          ¿Quieres eliminar tu cuenta?
        </h2>

        <div className="rounded-lg border border-error/40 bg-error-tenue px-4 py-3 text-sm text-error">
          Eliminar tu cuenta es definitivo.
        </div>

        <p id="descripcion-eliminar-cuenta" className="text-sm leading-relaxed text-texto-suave">
          Se eliminarán tu perfil y tus salas. El historial de salas ajenas conservará los mensajes como «Cuenta
          eliminada». Tu nombre de usuario quedará disponible.
        </p>

        {error && <Alerta tipo="error">{error}</Alerta>}

        <div className="mt-1 flex flex-col gap-3">
          <Boton to="/perfil" variante="secundario">
            Conservar mi cuenta
          </Boton>

          <Boton
            variante="peligro"
            cargando={eliminando}
            onClick={() => {
              void confirmarEliminacion()
            }}
          >
            {eliminando ? 'Eliminando cuenta…' : 'Eliminar cuenta'}
          </Boton>
        </div>
      </div>
    </section>
  )
}

export default EliminarCuenta