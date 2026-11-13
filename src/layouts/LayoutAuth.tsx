import { Outlet } from 'react-router-dom'
import HeroAuth from '../components/HeroAuth'
import Logo from '../components/Logo'
import PiePagina from '../components/PiePagina'
import SaltarAlContenido from '../components/SaltarAlContenido'
import { useFocoAlNavegar } from '../hooks/useFocoAlNavegar'

/** Pantallas de acceso: logo arriba, presentación a la izquierda (solo escritorio) y formulario a la derecha. */
function LayoutAuth() {
  useFocoAlNavegar()
  return (
    <div className="flex min-h-screen flex-col">
      <SaltarAlContenido />
      <header className="mx-auto w-full max-w-6xl px-4 py-4">
        <Logo />
      </header>
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-4 py-6 sm:py-10 lg:grid-cols-2 lg:gap-16">
          <HeroAuth />
          <div className="mx-auto w-full max-w-xl lg:max-w-none">
            <Outlet />
          </div>
        </div>
      </main>
      <PiePagina />
    </div>
  )
}

export default LayoutAuth
