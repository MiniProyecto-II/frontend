import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import NavegacionPrivada from '../components/NavegacionPrivada'
import PiePagina from '../components/PiePagina'
import SaltarAlContenido from '../components/SaltarAlContenido'
import { useFocoAlNavegar } from '../hooks/useFocoAlNavegar'

function obtenerTituloBarraMovil(pathname: string): string {
  if (pathname === '/salas') return 'Mis salas'
  if (pathname === '/salas/crear') return 'Crear sala'
  if (pathname === '/salas/unirse') return 'Unirse con ID'
  if (pathname.endsWith('/editar')) return 'Editar sala'
  if (pathname.endsWith('/eliminar')) return 'Eliminar sala'
  if (pathname.startsWith('/salas/')) return 'Sala de estudio'
  if (pathname === '/perfil') return 'Mi perfil'
  if (pathname === '/perfil/editar') return 'Editar perfil'
  if (pathname === '/perfil/eliminar') return 'Eliminar cuenta'
  return 'Salón de Estudio'
}

// Las rutas privadas se protegen en routes/guardas.tsx (RutaPrivada)
function LayoutPrivado() {
  useFocoAlNavegar()
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonAbrirRef = useRef<HTMLButtonElement>(null)

  const tituloBarra = obtenerTituloBarraMovil(pathname)

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  // Cerrar con Escape y bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (!menuAbierto) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAbierto(false)
        setTimeout(() => botonAbrirRef.current?.focus(), 0)
      }
    }

    window.addEventListener('keydown', alPresionarTecla)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', alPresionarTecla)
    }
  }, [menuAbierto])

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SaltarAlContenido />

      {/* Barra superior compacta solo para móvil (fiel a Figma) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-borde bg-barra px-4 py-3 md:hidden">
        <button
          ref={botonAbrirRef}
          type="button"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil-privado"
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-acento transition-colors hover:bg-superficie"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            className="size-6"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <span className="truncate text-sm font-bold text-texto">{tituloBarra}</span>
      </header>

      {/* Menú lateral desplegable (drawer) en móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menú principal">
          {/* Fondo oscuro */}
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Panel lateral */}
          <aside
            id="menu-movil-privado"
            className="relative z-10 flex h-full w-72 max-w-[82vw] flex-col gap-6 overflow-y-auto border-r border-borde bg-barra px-4 py-5"
          >
            <div className="flex items-center justify-between gap-2">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú de navegación"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie hover:text-texto"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <NavegacionPrivada onNavegar={() => setMenuAbierto(false)} />
          </aside>
        </div>
      )}

      {/* Barra lateral fija en escritorio */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:gap-6 md:overflow-y-auto md:border-r md:border-borde md:bg-barra md:px-4 md:py-5">
        <Logo />
        <NavegacionPrivada />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-14">
            <Outlet />
          </div>
        </main>
        <PiePagina />
      </div>
    </div>
  )
}

export default LayoutPrivado