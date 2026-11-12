import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import SelectorAvatar from '../components/SelectorAvatar'
import TarjetaAuth from '../components/TarjetaAuth'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { ApiError } from '../services/api'
import { CODIGO_CORREO_OCUPADO, CODIGO_USERNAME_OCUPADO } from '../services/contrato'
import {
  REGLA_CONTRASENA,
  iniciales,
  validarContrasena,
  validarCorreo,
  validarTextoObligatorio,
  validarUsername,
} from '../utils/validaciones'

type Campo = 'nombres' | 'apellidos' | 'username' | 'correo' | 'contrasena'
type Errores = Partial<Record<Campo, string>>

interface Valores {
  nombres: string
  apellidos: string
  username: string
  avatar: string
  correo: string
  contrasena: string
}

const VALORES_INICIALES: Valores = {
  nombres: '',
  apellidos: '',
  username: '',
  avatar: 'violeta',
  correo: '',
  contrasena: '',
}

function validar(campo: Campo, valores: Valores): string | null {
  switch (campo) {
    case 'nombres':
      return validarTextoObligatorio(valores.nombres, 'nombres')
    case 'apellidos':
      return validarTextoObligatorio(valores.apellidos, 'apellidos')
    case 'username':
      return validarUsername(valores.username)
    case 'correo':
      return validarCorreo(valores.correo)
    case 'contrasena':
      return validarContrasena(valores.contrasena)
  }
}

const CAMPOS: Campo[] = ['nombres', 'apellidos', 'username', 'correo', 'contrasena']

/** Campos de la API → campos del formulario (para errores de validación del servidor). */
const CAMPO_DE_API: Record<string, Campo> = {
  firstName: 'nombres',
  lastName: 'apellidos',
  username: 'username',
  email: 'correo',
  password: 'contrasena',
}

function Registro() {
  const { registrar } = useAuth()

  const [valores, setValores] = useState<Valores>(VALORES_INICIALES)
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [correoRegistrado, setCorreoRegistrado] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const ocupado = enviando
  const conErrores = Object.keys(errores).length > 0 || errorGeneral !== null

  useTituloPagina(conErrores ? 'Revisa tus datos' : 'Crear cuenta')

  const enfocarPrimerError = (formulario: HTMLFormElement) => {
    setTimeout(() => formulario.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0)
  }

  const cambiar = <K extends keyof Valores>(campo: K, valor: Valores[K]) => {
    const nuevos = { ...valores, [campo]: valor }
    setValores(nuevos)
    if (campo === 'correo') setCorreoRegistrado(false)
    if (campo !== 'avatar') {
      const c: Campo = campo
      // Tras un primer intento se revalida al escribir; antes solo se limpia el error del campo.
      setErrores((previos) => {
        const siguientes = { ...previos }
        const mensaje = intentado ? validar(c, nuevos) : null
        if (mensaje) siguientes[c] = mensaje
        else delete siguientes[c]
        return siguientes
      })
    }
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (ocupado) return
    const formulario = evento.currentTarget

    setIntentado(true)
    setErrorGeneral(null)
    setCorreoRegistrado(false)

    const nuevos: Errores = {}
    for (const campo of CAMPOS) {
      const mensaje = validar(campo, valores)
      if (mensaje) nuevos[campo] = mensaje
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) {
      enfocarPrimerError(formulario)
      return
    }

    setEnviando(true)
    try {
      await registrar(valores)
      // Con la cuenta creada y la sesión iniciada, la ruta de invitados lleva al panel.
    } catch (err) {
      setEnviando(false)
      const delServidor: Errores = {}

      if (err instanceof ApiError && err.codigo === CODIGO_USERNAME_OCUPADO) {
        delServidor.username = 'Ese nombre de usuario ya está en uso. Prueba con otro.'
      } else if (err instanceof ApiError && err.codigo === CODIGO_CORREO_OCUPADO) {
        delServidor.correo = 'Este correo ya está registrado.'
        setCorreoRegistrado(true)
      } else if (err instanceof ApiError && err.campos) {
        for (const [claveApi, mensaje] of Object.entries(err.campos)) {
          const campo = CAMPO_DE_API[claveApi]
          if (campo) delServidor[campo] = mensaje
        }
      }

      if (Object.keys(delServidor).length > 0) {
        setErrores(delServidor)
        enfocarPrimerError(formulario)
      } else {
        setErrorGeneral(err instanceof Error ? err.message : 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
      }
    }
  }

  const volverAlRegistro = () => {
    setErrores({})
    setErrorGeneral(null)
    setCorreoRegistrado(false)
    setIntentado(false)
  }

  return (
    <TarjetaAuth
      titulo={conErrores ? 'Revisa tus datos' : 'Crea tu cuenta'}
      subtitulo={conErrores ? 'Conservamos los datos que ingresaste.' : 'Tu próxima sesión de estudio empieza aquí.'}
    >
      {errorGeneral && <Alerta tipo="error">{errorGeneral}</Alerta>}

      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <CampoTexto
          id="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          valor={valores.nombres}
          onChange={(v) => cambiar('nombres', v)}
          error={errores.nombres}
          maxLength={60}
        />
        <CampoTexto
          id="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          valor={valores.apellidos}
          onChange={(v) => cambiar('apellidos', v)}
          error={errores.apellidos}
          maxLength={60}
        />
        <CampoTexto
          id="username"
          etiqueta="Nombre de usuario"
          autoComplete="username"
          valor={valores.username}
          onChange={(v) => cambiar('username', v)}
          error={errores.username}
          maxLength={20}
        />
        <SelectorAvatar
          valor={valores.avatar}
          onChange={(id) => cambiar('avatar', id)}
          iniciales={iniciales(valores.nombres, valores.apellidos)}
        />
        <CampoTexto
          id="correo"
          etiqueta="Correo institucional"
          tipo="email"
          inputMode="email"
          autoComplete="email"
          valor={valores.correo}
          onChange={(v) => cambiar('correo', v)}
          error={errores.correo}
          extra={
            correoRegistrado ? (
              <Link to="/ingreso" className="w-fit rounded text-sm font-semibold text-acento underline underline-offset-4">
                Ir a iniciar sesión
              </Link>
            ) : null
          }
        />
        <CampoTexto
          id="contrasena"
          etiqueta="Contraseña"
          tipo="password"
          autoComplete="new-password"
          valor={valores.contrasena}
          onChange={(v) => cambiar('contrasena', v)}
          error={errores.contrasena}
          ayuda={errores.contrasena ? undefined : REGLA_CONTRASENA}
        />

        <div className="flex flex-col gap-3">
          <Boton type="submit" cargando={enviando}>
            {enviando ? 'Creando tu cuenta…' : conErrores ? 'Corregir datos' : 'Crear cuenta'}
          </Boton>
        </div>
        <p role="status" className="sr-only">
          {enviando ? 'Creando tu cuenta…' : ''}
        </p>
      </form>

      <div className="flex flex-col gap-1 border-t border-borde pt-5">
        {conErrores ? (
          <Boton variante="texto" onClick={volverAlRegistro}>
            Volver al registro
          </Boton>
        ) : (
          <>
            <p className="text-sm text-texto-suave">¿Ya tienes una cuenta?</p>
            <Boton variante="texto" to="/ingreso">
              Iniciar sesión
            </Boton>
          </>
        )}
      </div>
    </TarjetaAuth>
  )
}

export default Registro
