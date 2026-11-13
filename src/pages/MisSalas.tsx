import Boton from '../components/Boton'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Mis salas'

/** Panel de la persona. Las salas se implementan en un sprint posterior: por ahora, el estado vacío. */
function MisSalas() {
  useTituloPagina(TITULO)
  return (
    <>
      <h1 tabIndex={-1} className="text-3xl font-bold wrap-break-word text-texto sm:text-4xl">
        {TITULO}
      </h1>
      <p className="mt-3 text-texto-suave">Un lugar para cada grupo. Retoma una sala o crea algo nuevo.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Boton to="/salas/crear" ancho="auto">
          + Crear sala
        </Boton>
        <Boton to="/salas/unirse" variante="secundario" ancho="auto">
          Unirse con un ID
        </Boton>
      </div>

      <section
        aria-labelledby="sin-salas"
        className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-borde bg-superficie p-6"
      >
        <h2 id="sin-salas" className="text-lg font-semibold text-texto">
          Todavía no tienes salas
        </h2>
        <p className="text-texto-suave">
          Crea una sala para tu grupo o únete con el ID que te compartió un compañero.
        </p>
      </section>
    </>
  )
}

export default MisSalas
