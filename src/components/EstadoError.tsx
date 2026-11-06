import TarjetaEstado from './TarjetaEstado'

interface Props {
  detalle: string | null
  onReintentar: () => void
  deshabilitado?: boolean
}

function EstadoError({ detalle, onReintentar, deshabilitado = false }: Props) {
  return (
    <TarjetaEstado role="alert" acento="error">
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 size-6 shrink-0 text-error"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4.5" />
          <path d="M12 16h.01" />
        </svg>
        <h2 className="min-w-0 text-lg font-semibold text-texto">No pudimos cargar la información</h2>
      </div>
      <p className="text-texto">Comprueba tu conexión y vuelve a intentarlo.</p>
      {detalle && <p className="text-sm text-texto-suave">Detalle: {detalle}</p>}

      <button
        type="button"
        onClick={() => {
          if (!deshabilitado) onReintentar()
        }}
        aria-disabled={deshabilitado}
        className="mt-auto min-h-12 w-full cursor-pointer rounded-lg bg-primario px-6 py-3 font-semibold text-texto transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-error-tenue focus-visible:outline-none active:bg-primario-activo aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-primario"
      >
        Reintentar
      </button>
    </TarjetaEstado>
  )
}

export default EstadoError
