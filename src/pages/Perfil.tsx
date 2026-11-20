import AvatarIniciales from '../components/AvatarIniciales'
import Boton from '../components/Boton'
import EstadoCargando from '../components/EstadoCargando'
import EstadoError from '../components/EstadoError'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Mi perfil'

function obtenerIniciales(nombres: string, apellidos: string): string {
  const n = nombres.trim().charAt(0)
  const a = apellidos.trim().charAt(0)
  return `${n}${a}`.toUpperCase() || 'US'
}

function Perfil() {
  useTituloPagina(TITULO)
  const { estado, perfil, errorSesion, reintentarSesion } = useAuth()

  if (estado === 'cargando') {
    return <EstadoCargando />
  }

  if (estado === 'error' || !perfil) {
    return (
      <EstadoError
        detalle={errorSesion ?? 'No encontramos los datos de tu perfil.'}
        onReintentar={() => {
          void reintentarSesion()
        }}
      />
    )
  }

  const iniciales = obtenerIniciales(perfil.firstName, perfil.lastName)

  return (
    <section aria-labelledby="titulo-perfil" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 id="titulo-perfil" tabIndex={-1} className="text-3xl font-bold tracking-tight text-texto outline-none">
          {TITULO}
        </h1>
        <p className="text-texto-suave">Así te verá tu equipo dentro de las salas.</p>
      </header>

      <div className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8">
        <h2 className="text-xl font-bold text-texto">
          {perfil.firstName} {perfil.lastName}
        </h2>

        <div className="flex flex-col gap-3">
          <AvatarIniciales iniciales={iniciales} avatar={perfil.avatar} tamano="lg" />
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-semibold text-acento">{perfil.username}</p>
            <p className="text-sm text-texto-suave">{perfil.email}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          <Boton to="/perfil/editar" variante="primario">
            Editar perfil
          </Boton>
          <Boton to="/salas" variante="secundario">
            Volver a Mis salas
          </Boton>
          <Boton to="/perfil/eliminar" variante="texto">
            Eliminar cuenta
          </Boton>
        </div>
      </div>
    </section>
  )
}

export default Perfil