import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { iniciales } from '../utils/validaciones'
import AvatarIniciales from './AvatarIniciales'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium transition-[color,background-color] duration-150 ${
    isActive ? 'bg-nav-activo text-texto' : 'text-texto-suave hover:bg-superficie hover:text-texto'
  }`

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0 text-acento"
    >
      {children}
    </svg>
  )
}

const iconoLibro = (
  <>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </>
)

interface Props {
  onNavegar?: () => void
}

/** Navegación del área privada: salas arriba y bloque de cuenta abajo. */
function NavegacionPrivada({ onNavegar }: Props) {
  const { perfil, cerrarSesion } = useAuth()
  return (
    <div className="flex flex-1 flex-col justify-between gap-6">
      <nav aria-label="Salas">
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink to="/salas" end className={claseEnlace} onClick={onNavegar}>
              <Icono>
                <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
              </Icono>
              Mis salas
            </NavLink>
          </li>
          <li>
            <NavLink to="/salas/crear" end className={claseEnlace} onClick={onNavegar}>
              <Icono>{iconoLibro}</Icono>
              Crear sala
            </NavLink>
          </li>
          <li>
            <NavLink to="/salas/unirse" end className={claseEnlace} onClick={onNavegar}>
              <Icono>{iconoLibro}</Icono>
              Unirse con ID
            </NavLink>
          </li>
        </ul>
      </nav>

      <nav aria-label="Cuenta" className="rounded-xl border border-borde bg-superficie p-3">
        <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-texto-suave uppercase">Tu cuenta</p>
        {perfil && (
          <div className="flex items-center gap-3 px-3 pb-2">
            <AvatarIniciales iniciales={iniciales(perfil.firstName, perfil.lastName)} avatar={perfil.avatar} />
            <p className="min-w-0 truncate font-semibold text-texto">{perfil.username}</p>
          </div>
        )}
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink
              to="/perfil"
              end
              onClick={onNavegar}
              className={({ isActive }) => `${claseEnlace({ isActive })} justify-center`}
            >
              Mi perfil
            </NavLink>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onNavegar?.()
                void cerrarSesion()
              }}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg px-3 font-medium text-texto-suave transition-[color,background-color] duration-150 hover:bg-secundario hover:text-texto"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default NavegacionPrivada