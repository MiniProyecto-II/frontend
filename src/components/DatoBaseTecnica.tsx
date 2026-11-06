import { useLayoutEffect, useRef } from 'react'
import { useBaseTecnica } from '../hooks/useBaseTecnica'
import { useVistaSinParpadeo } from '../hooks/useVistaSinParpadeo'
import EstadoCargando from './EstadoCargando'
import EstadoError from './EstadoError'
import EstadoExito from './EstadoExito'

function DatoBaseTecnica() {
  const { data, status, error, reintentar } = useBaseTecnica()
  const vista = useVistaSinParpadeo(status)

  const contenedorRef = useRef<HTMLDivElement>(null)
  const recuperarFoco = useRef(false)

  // Si el botón con foco desaparece al cambiar de estado, el foco queda en este
  // contenedor (no salta al inicio de la página) y el siguiente Tab sigue aquí.
  useLayoutEffect(() => {
    if (!recuperarFoco.current) return
    const activo = document.activeElement
    if (!activo || activo === document.body) {
      contenedorRef.current?.focus({ preventScroll: true })
    }
    recuperarFoco.current = vista === 'cargando'
  }, [vista])

  const alReintentar = () => {
    recuperarFoco.current = true
    reintentar()
  }

  return (
    <div ref={contenedorRef} tabIndex={-1} className="mt-8 w-full outline-none">
      {vista === 'oculto' && <div aria-hidden="true" className="min-h-[19rem]" />}
      {vista === 'cargando' && <EstadoCargando />}
      {vista === 'error' && (
        <EstadoError
          detalle={error}
          onReintentar={alReintentar}
          deshabilitado={status === 'cargando'}
        />
      )}
      {vista === 'exito' && data && <EstadoExito dato={data} />}
    </div>
  )
}

export default DatoBaseTecnica
