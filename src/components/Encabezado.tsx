import { NavLink } from 'react-router-dom'
import Logo from './Logo'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-12 items-center rounded-lg px-4 font-semibold transition-[color,background-color] duration-150 ${
    isActive ? 'bg-nav-activo text-texto' : 'text-texto-suave hover:bg-superficie hover:text-texto'
  }`

function Encabezado() {
  return (
    <header className="border-b border-borde">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Logo />
        <nav aria-label="Principal">
          <ul className="flex flex-wrap gap-2">
            <li>
              <NavLink to="/ingreso" end className={claseEnlace}>
                Iniciar sesión
              </NavLink>
            </li>
            <li>
              <NavLink to="/registro" end className={claseEnlace}>
                Crear cuenta
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Encabezado
