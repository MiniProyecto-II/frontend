import type { ReactNode } from 'react'

type Tipo = 'error' | 'aviso' | 'exito'

const estilos: Record<Tipo, string> = {
  error: 'border-error/60 bg-error-tenue text-error',
  aviso: 'border-aviso/60 bg-aviso-tenue text-aviso',
  exito: 'border-exito/60 bg-exito-tenue text-exito',
}

const iconos: Record<Tipo, ReactNode> = {
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5M12 16h.01" />
    </>
  ),
  aviso: (
    <>
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  exito: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
}

interface Props {
  tipo: Tipo
  children: ReactNode
  id?: string
}

/** Mensaje de estado: los errores se anuncian de inmediato (alert); avisos y confirmaciones, con calma (status). */
function Alerta({ tipo, children, id }: Props) {
  return (
    <div
      id={id}
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex animate-aparecer items-start gap-3 rounded-lg border px-4 py-3 text-sm motion-reduce:animate-none ${estilos[tipo]}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 size-5 shrink-0"
      >
        {iconos[tipo]}
      </svg>
      <div className="min-w-0 wrap-break-word">{children}</div>
    </div>
  )
}

export default Alerta
