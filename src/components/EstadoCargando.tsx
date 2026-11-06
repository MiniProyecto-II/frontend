import { useEffect, useState } from 'react'
import TarjetaEstado from './TarjetaEstado'

/** Tras este tiempo se avisa de que el servidor gratuito puede estar despertando. */
const AVISO_LENTO_MS = 5000

/** Placeholder con la forma del contenido final (etiqueta y valor). */
function EstadoCargando() {
  const [lento, setLento] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLento(true), AVISO_LENTO_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    // Sin aria-busy: haría que los lectores de pantalla callen el aviso de carga lenta.
    <TarjetaEstado role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 size-6 shrink-0 text-acento"
        >
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
        <h2 className="min-w-0 text-lg font-semibold text-texto">Cargando…</h2>
      </div>
      <p className="text-texto-suave">Estamos consultando la información.</p>
      {/* Se añade dentro del mismo role="status": se anuncia solo esta línea nueva. */}
      {lento && (
        <p className="text-sm text-texto-suave">El servidor puede tardar hasta un minuto en despertar.</p>
      )}

      <div aria-hidden="true" className="mt-auto flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
        <div className="h-3 w-24 rounded bg-borde" />
        <div className="h-6 w-4/5 rounded bg-borde" />
      </div>
    </TarjetaEstado>
  )
}

export default EstadoCargando
