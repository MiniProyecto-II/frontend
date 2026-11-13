import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variante = 'primario' | 'secundario' | 'texto'

const estilos: Record<Variante, string> = {
  primario: 'bg-primario text-texto hover:bg-primario-hover active:bg-primario-activo',
  secundario: 'border border-borde bg-secundario text-texto hover:bg-borde',
  texto: 'text-texto-suave hover:bg-superficie hover:text-texto',
}

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variante?: Variante
  /** Muestra un indicador y bloquea nuevos envíos sin quitar el foco del botón. */
  cargando?: boolean
  /** Si se pasa, se dibuja un enlace (con aspecto de botón) en vez de un <button>. */
  to?: string
  /** `completo` ocupa todo el ancho; `auto` se ajusta al contenido. */
  ancho?: 'completo' | 'auto'
  children: ReactNode
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="size-5 animate-spin motion-reduce:animate-none"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}

/** Un solo botón para todo el producto: primario (una acción principal por pantalla), secundario y texto. */
function Boton({ variante = 'primario', cargando = false, to, ancho = 'completo', children, onClick, ...resto }: Props) {
  const clase = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-center font-semibold transition-colors duration-150 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${
    ancho === 'completo' ? 'w-full' : ''
  } ${estilos[variante]}`

  if (to) {
    return (
      <Link to={to} className={clase}>
        {children}
      </Link>
    )
  }

  return (
    <button
      {...resto}
      type={resto.type ?? 'button'}
      aria-disabled={cargando || resto.disabled || undefined}
      onClick={(evento) => {
        // aria-disabled no bloquea el clic por sí solo: se ignora mientras carga.
        if (cargando || resto.disabled) {
          evento.preventDefault()
          return
        }
        onClick?.(evento)
      }}
      className={clase}
    >
      {cargando && <Spinner />}
      {children}
    </button>
  )
}

export default Boton
