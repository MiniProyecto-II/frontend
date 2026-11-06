import { Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import NavegacionPrivada from '../components/NavegacionPrivada'
import PiePagina from '../components/PiePagina'

// PENDIENTE: proteger rutas privadas en el Sprint 1
function LayoutPrivado() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Escritorio: barra lateral. Celular: barra de navegación arriba, sin menú desplegable. */}
      <header className="flex flex-col gap-3 border-b border-borde bg-barra px-4 py-3 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:gap-6 md:overflow-y-auto md:border-r md:border-b-0 md:py-5">
        <Logo />
        <NavegacionPrivada />
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
          <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
            <Outlet />
          </div>
        </main>
        <PiePagina />
      </div>
    </div>
  )
}

export default LayoutPrivado
