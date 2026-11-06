import { NavLink } from 'react-router-dom'

function PiePagina() {
  return (
    <footer className="border-t border-borde">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 text-sm text-texto-suave">
        <p>Salón de Estudio · Tu comunidad de aprendizaje</p>
        <NavLink
          to="/accesibilidad"
          end
          className="inline-flex min-h-12 items-center rounded-lg underline-offset-4 hover:text-texto hover:underline aria-[current=page]:text-texto aria-[current=page]:underline"
        >
          Accesibilidad
        </NavLink>
      </div>
    </footer>
  )
}

export default PiePagina
