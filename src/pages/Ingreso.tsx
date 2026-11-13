import { useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import TarjetaAuth from '../components/TarjetaAuth'
import { ErrorAuth } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'

interface EstadoNavegacion {
  sesionCerrada?: boolean
  googleCancelado?: boolean
}

function Ingreso() {
  const { iniciarSesion, iniciarConGoogle } = useAuth()
  const estadoNav = (useLocation().state ?? {}) as EstadoNavegacion

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null)
  const [errorContrasena, setErrorContrasena] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviandoGoogle, setEnviandoGoogle] = useState(false)
  const [cancelado, setCancelado] = useState(estadoNav.googleCancelado === true)

  const ocupado = enviando || enviandoGoogle
  const conError = errorGeneral !== null

  useTituloPagina(cancelado ? 'Ingreso cancelado' : conError ? 'No pudimos iniciar sesión' : 'Iniciar sesión')

  const entrarConGoogle = async () => {
    if (ocupado) return
    setErrorGeneral(null)
    setEnviandoGoogle(true)
    try {
      await iniciarConGoogle()
      // Si todo sale bien, la ruta de invitados lleva al panel o a elegir el username.
    } catch (err) {
      if (err instanceof ErrorAuth && err.tipo === 'cancelado') {
        setCancelado(true)
      } else {
        setCancelado(false)
        setErrorGeneral(err instanceof Error ? err.message : 'No pudimos iniciar sesión con Google.')
      }
      setEnviandoGoogle(false)
    }
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (ocupado) return

    const eCorreo = correo.trim() === '' ? 'Escribe tu correo.' : validarCorreoBasico(correo)
    const eContrasena = contrasena === '' ? 'Escribe tu contraseña.' : null
    setErrorCorreo(eCorreo)
    setErrorContrasena(eContrasena)
    setErrorGeneral(null)
    if (eCorreo || eContrasena) {
      const primero = evento.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')
      setTimeout(() => primero?.focus(), 0)
      return
    }

    setEnviando(true)
    try {
      await iniciarSesion(correo, contrasena)
    } catch (err) {
      // Mensaje genérico: no se revela si falló el correo o la contraseña.
      setErrorGeneral(err instanceof Error ? err.message : 'Correo o contraseña incorrectos.')
      setEnviando(false)
    }
  }

  if (cancelado) {
    return (
      <TarjetaAuth titulo="Ingreso cancelado" subtitulo="No se inició ninguna sesión.">
        <Alerta tipo="aviso">Cerraste el acceso de Google. Puedes volver a intentarlo.</Alerta>
        <div className="flex flex-col gap-3">
          <Boton onClick={() => setCancelado(false)}>Volver a iniciar sesión</Boton>
          <Boton
            variante="secundario"
            cargando={enviandoGoogle}
            onClick={() => {
              setCancelado(false)
              void entrarConGoogle()
            }}
          >
            {enviandoGoogle ? 'Abriendo Google…' : 'Reintentar con Google'}
          </Boton>
        </div>
      </TarjetaAuth>
    )
  }

  return (
    <TarjetaAuth
      titulo={conError ? 'No pudimos iniciar sesión' : '¡Qué bueno verte de nuevo!'}
      subtitulo={conError ? 'Revisa tus datos e inténtalo de nuevo.' : 'Inicia sesión para encontrarte con tu grupo.'}
    >
      {estadoNav.sesionCerrada && !conError && <Alerta tipo="exito">Cerraste sesión. Hasta pronto.</Alerta>}
      {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}

      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <CampoTexto
          id="correo"
          etiqueta="Correo"
          tipo="email"
          inputMode="email"
          autoComplete="username"
          valor={correo}
          onChange={(v) => {
            setCorreo(v)
            setErrorCorreo(null)
          }}
          error={errorCorreo}
        />
        <CampoTexto
          id="contrasena"
          etiqueta="Contraseña"
          tipo="password"
          autoComplete="current-password"
          valor={contrasena}
          onChange={(v) => {
            setContrasena(v)
            setErrorContrasena(null)
          }}
          error={errorContrasena}
        />

        <div className="flex flex-col gap-3">
          <Boton type="submit" cargando={enviando}>
            {enviando ? 'Iniciando sesión…' : conError ? 'Corregir e iniciar sesión' : 'Iniciar sesión'}
          </Boton>
          {!conError && (
            <Boton variante="secundario" cargando={enviandoGoogle} onClick={() => void entrarConGoogle()}>
              {enviandoGoogle ? 'Abriendo Google…' : 'Continuar con Google'}
            </Boton>
          )}
        </div>
        <p role="status" className="sr-only">
          {enviando ? 'Iniciando sesión…' : enviandoGoogle ? 'Abriendo Google…' : ''}
        </p>
      </form>

      <div className="flex flex-col gap-1 border-t border-borde pt-5">
        {!conError && <p className="text-sm text-texto-suave">¿Es tu primera vez por aquí?</p>}
        <Boton variante="texto" to="/registro">
          Crear cuenta
        </Boton>
      </div>
    </TarjetaAuth>
  )
}

/** Formato de correo sin exigir dominio: en el ingreso solo se avisa si claramente está mal escrito. */
function validarCorreoBasico(valor: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()) ? null : 'Escribe un correo válido.'
}

export default Ingreso
