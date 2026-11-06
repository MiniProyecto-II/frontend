import { useEffect, useRef, useState } from 'react'
import type { EstadoPeticion } from './useBaseTecnica'

/** 'oculto': todavía no se muestra nada (cargas muy rápidas no enseñan el skeleton). */
export type Vista = 'oculto' | EstadoPeticion

const RETRASO_CARGANDO_MS = 300
const MINIMO_CARGANDO_MS = 400

/**
 * Traduce el estado de la petición a lo que se pinta, evitando parpadeos:
 * - En la carga inicial, el estado "cargando" solo aparece si tarda más de 300 ms.
 * - Al reintentar desde un error, "cargando" aparece de inmediato (el usuario pidió la acción).
 * - Si "cargando" llega a mostrarse, se mantiene al menos 400 ms.
 */
export function useVistaSinParpadeo(status: EstadoPeticion): Vista {
  const [vista, setVista] = useState<Vista>('oculto')
  const vistaRef = useRef<Vista>('oculto')
  const cargandoDesde = useRef(0)

  useEffect(() => {
    const mostrar = (v: Vista) => {
      if (v === 'cargando') cargandoDesde.current = Date.now()
      vistaRef.current = v
      setVista(v)
    }

    let timer: ReturnType<typeof setTimeout> | undefined

    if (status === 'cargando') {
      if (vistaRef.current === 'error' || vistaRef.current === 'exito') {
        mostrar('cargando')
      } else if (vistaRef.current === 'oculto') {
        timer = setTimeout(() => mostrar('cargando'), RETRASO_CARGANDO_MS)
      }
    } else if (vistaRef.current === 'cargando') {
      const restante = MINIMO_CARGANDO_MS - (Date.now() - cargandoDesde.current)
      if (restante > 0) timer = setTimeout(() => mostrar(status), restante)
      else mostrar(status)
    } else {
      mostrar(status)
    }

    return () => clearTimeout(timer)
  }, [status])

  return vista
}
