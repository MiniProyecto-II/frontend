import { useCallback, useEffect, useState } from 'react'
import type { BaseTecnica } from '../services/contrato'
import { obtenerBaseTecnica } from '../services/baseTecnicaService'

export type EstadoPeticion = 'cargando' | 'error' | 'exito'

interface EstadoBaseTecnica {
  data: BaseTecnica | null
  status: EstadoPeticion
  error: string | null
}

const MENSAJE_GENERICO = 'Ocurrió un error inesperado al cargar los datos.'

export function useBaseTecnica() {
  const [estado, setEstado] = useState<EstadoBaseTecnica>({
    data: null,
    status: 'cargando',
    error: null,
  })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    obtenerBaseTecnica(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setEstado({ data, status: 'exito', error: null })
      })
      .catch((err: unknown) => {
        // Cancelada por desmontaje (o por el doble efecto de StrictMode): se ignora.
        if (controller.signal.aborted) return
        const mensaje = err instanceof Error && err.message ? err.message : MENSAJE_GENERICO
        setEstado({ data: null, status: 'error', error: mensaje })
      })

    return () => controller.abort()
  }, [intento])

  const reintentar = useCallback(() => {
    setEstado({ data: null, status: 'cargando', error: null })
    setIntento((n) => n + 1)
  }, [])

  return { ...estado, reintentar }
}
