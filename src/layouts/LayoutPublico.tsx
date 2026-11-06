import { Outlet } from 'react-router-dom'
import Encabezado from '../components/Encabezado'
import PiePagina from '../components/PiePagina'

function LayoutPublico() {
  return (
    <div className="flex min-h-screen flex-col">
      <Encabezado />
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
          <Outlet />
        </div>
      </main>
      <PiePagina />
    </div>
  )
}

export default LayoutPublico
