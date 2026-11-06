import { Link } from 'react-router-dom'
import TarjetaEstado from '../components/TarjetaEstado'
import { useTituloPagina } from '../hooks/useTituloPagina'

function NoEncontrada() {
  useTituloPagina('Página no encontrada')
  return (
    <div className="mx-auto max-w-xl">
      <TarjetaEstado>
        <div className="flex items-start gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-1 size-7 shrink-0 text-acento"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <h1 tabIndex={-1} className="min-w-0 text-2xl font-bold text-texto sm:text-3xl">
            No encontramos esa página
          </h1>
        </div>
        <p className="text-texto-suave">Revisa la dirección o vuelve al inicio.</p>
        <Link
          to="/"
          className="mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primario px-6 py-3 font-semibold text-texto transition-[color,background-color] duration-150 hover:bg-primario-hover active:bg-primario-activo"
        >
          Ir al inicio
        </Link>
      </TarjetaEstado>
    </div>
  )
}

export default NoEncontrada
