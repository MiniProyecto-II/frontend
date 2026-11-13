import { useState, type FormEvent } from 'react'
import Alerta from '../components/Alerta'
import AvatarIniciales from '../components/AvatarIniciales'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import TarjetaAuth from '../components/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { ApiError } from '../services/api'
import { CODIGO_USERNAME_OCUPADO } from '../services/contrato'
import { inicialesDeNombre, sugerirUsername } from '../utils/nombres'
import { REGLA_USERNAME, validarUsername } from '../utils/validaciones'

const TITULO = 'Un último paso'

/** Registro con Google: obligatorio elegir un username antes de entrar a cualquier ruta privada. */
function RegistroUsuario() {
  const { datosAuth, completarPerfil, cerrarSesion } = useAuth()
  useTituloPagina(TITULO)

  const [username, setUsername] = useState(() => sugerirUsername(datosAuth?.correo))
  const [error, setError] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enfocarCampo = () => setTimeout(() => document.getElementById('username')?.focus(), 0)

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (enviando) return

    const invalido = validarUsername(username)
    setError(invalido)
    setErrorGeneral(null)
    if (invalido) {
      enfocarCampo()
      return
    }

    setEnviando(true)
    try {
      await completarPerfil(username)
      // Con el perfil completo, la ruta lleva al panel.
    } catch (err) {
      setEnviando(false)
      if (err instanceof ApiError && err.codigo === CODIGO_USERNAME_OCUPADO) {
        setError('Ese nombre de usuario ya está en uso. Prueba con otro.')
        enfocarCampo()
      } else if (err instanceof ApiError && err.campos?.username) {
        setError(err.campos.username)
        enfocarCampo()
      } else {
        setErrorGeneral(err instanceof Error ? err.message : 'No pudimos guardar tu nombre de usuario.')
      }
    }
  }

  return (
    <TarjetaAuth titulo={TITULO} subtitulo="Elige el nombre que verá tu equipo.">
      {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}

      <AvatarIniciales iniciales={inicialesDeNombre(datosAuth?.nombre)} tamano="lg" />

      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <CampoTexto
          id="username"
          etiqueta="Nombre de usuario"
          autoComplete="username"
          valor={username}
          onChange={(v) => {
            setUsername(v)
            setError(null)
          }}
          error={error}
          ayuda={error ? undefined : `Tu nombre de usuario debe estar disponible antes de acceder a tus salas. ${REGLA_USERNAME}`}
          maxLength={20}
        />

        <div className="flex flex-col gap-3">
          <Boton type="submit" cargando={enviando}>
            {enviando ? 'Guardando…' : 'Completar registro'}
          </Boton>
          <Boton variante="texto" disabled={enviando} onClick={() => void cerrarSesion()}>
            Cancelar
          </Boton>
        </div>
        <p role="status" className="sr-only">
          {enviando ? 'Guardando tu nombre de usuario…' : ''}
        </p>
      </form>
    </TarjetaAuth>
  )
}

export default RegistroUsuario
