import type { HTMLAttributes, ReactNode } from 'react'

type Acento = 'neutro' | 'error' | 'exito'

const estilosAcento: Record<Acento, string> = {
  neutro: 'border-borde bg-superficie',
  error: 'border-borde border-l-error bg-error-tenue',
  exito: 'border-borde border-l-exito bg-superficie',
}

interface Props extends HTMLAttributes<HTMLElement> {
  acento?: Acento
  children: ReactNode
}

/**
 * Contenedor común de los tres estados: misma altura mínima (evita saltos de
 * diseño), mismo espaciado y fade corto al aparecer.
 */
function TarjetaEstado({ acento = 'neutro', className = '', children, ...resto }: Props) {
  return (
    <section
      {...resto}
      className={`flex min-h-[19rem] w-full animate-aparecer wrap-break-word flex-col gap-4 rounded-2xl border border-l-4 p-5 text-left motion-reduce:animate-none sm:p-8 ${estilosAcento[acento]} ${className}`}
    >
      {children}
    </section>
  )
}

export default TarjetaEstado
