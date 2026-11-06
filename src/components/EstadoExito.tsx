import type { BaseTecnica } from '../services/contrato'
import TarjetaEstado from './TarjetaEstado'

interface Props {
  dato: BaseTecnica
}

function EstadoExito({ dato }: Props) {
  return (
    <TarjetaEstado acento="exito" aria-live="polite" aria-label="Información de la base técnica">
      <div className="flex items-start gap-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-exito"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
        <p className="min-w-0 text-xs font-semibold tracking-wider text-texto-suave uppercase">
          Base técnica · Información actualizada
        </p>
      </div>

      <p className="text-2xl font-semibold text-texto">{dato.message}</p>
    </TarjetaEstado>
  )
}

export default EstadoExito
