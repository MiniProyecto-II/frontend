import { Link } from 'react-router-dom'

/** Logo «SE Salón de Estudio» que lleva al inicio. */
function Logo() {
  return (
    <Link
      to="/"
      className="inline-flex min-h-12 items-center gap-3 rounded-lg font-semibold text-texto"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primario text-sm font-bold text-texto"
      >
        SE
      </span>
      <span className="text-lg">Salón de Estudio</span>
    </Link>
  )
}

export default Logo
