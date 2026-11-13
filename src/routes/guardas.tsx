import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import EstadoError from '../components/EstadoError'
import { useAuth } from '../hooks/useAuth'
import { guardarRutaPendiente, leerRutaPendiente, limpiarRutaPendiente } from '../services/rutaPendiente'

/** Pantalla completa mientras se comprueba la sesión (un lector de pantalla la anuncia). */
function PantallaComprobando() {
  return (
    <div role="status" className="grid min-h-screen place-items-center px-4">
      <p className="flex items-center gap-3 text-texto-suave">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="size-5 animate-spin text-acento motion-reduce:animate-none"
        >
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
        Comprobando tu sesión…
      </p>
    </div>
  )
}

function PantallaErrorSesion() {
  const { errorSesion, reintentarSesion } = useAuth()
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-4">
      <h1 className="sr-only">Salón de Estudio</h1>
      <EstadoError detalle={errorSesion} onReintentar={() => void reintentarSesion()} />
    </main>
  )
}

/** Rutas privadas: sin sesión van al login (y recuerdan a dónde volver); sin username van a elegirlo. */
export function RutaPrivada() {
  const { estado, cierreVoluntario } = useAuth()
  const { pathname, search, hash } = useLocation()
  const sinSesion = estado === 'anonimo'

  useEffect(() => {
    if (sinSesion && !cierreVoluntario) guardarRutaPendiente(`${pathname}${search}${hash}`)
    if (estado === 'autenticado') limpiarRutaPendiente()
  }, [estado, sinSesion, cierreVoluntario, pathname, search, hash])

  if (estado === 'cargando') return <PantallaComprobando />
  if (estado === 'error') return <PantallaErrorSesion />
  if (sinSesion) {
    return <Navigate to="/ingreso" replace state={cierreVoluntario ? { sesionCerrada: true } : undefined} />
  }
  if (estado === 'sin-username') return <Navigate to="/registro/usuario" replace />
  return <Outlet />
}

/** Ingreso y registro: si ya hay sesión no tienen sentido, se va al panel (o a la ruta que se pidió). */
export function RutaSoloInvitados() {
  const { estado } = useAuth()
  if (estado === 'cargando') return <PantallaComprobando />
  if (estado === 'autenticado') return <Navigate to={leerRutaPendiente()} replace />
  if (estado === 'sin-username') return <Navigate to="/registro/usuario" replace />
  return <Outlet />
}

/** «Un último paso» (elegir username): solo para quien entró con Google y aún no lo tiene. */
export function RutaCompletarPerfil() {
  const { estado } = useAuth()
  if (estado === 'cargando') return <PantallaComprobando />
  if (estado === 'error') return <PantallaErrorSesion />
  if (estado === 'anonimo') return <Navigate to="/ingreso" replace />
  if (estado === 'autenticado') return <Navigate to={leerRutaPendiente()} replace />
  return <Outlet />
}
