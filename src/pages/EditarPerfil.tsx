import { useEffect, useState, type FormEvent } from 'react'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import EstadoCargando from '../components/EstadoCargando'
import SelectorAvatar from '../components/SelectorAvatar'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { ApiError } from '../services/api'
import { CODIGO_CORREO_OCUPADO, CODIGO_USERNAME_OCUPADO } from '../services/contrato'
import { actualizarMiPerfil } from '../services/usuariosService'

interface ErroresFormulario {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  general?: string
}

function obtenerIniciales(nombres: string, apellidos: string): string {
  const n = nombres.trim().charAt(0)
  const a = apellidos.trim().charAt(0)
  return `${n}${a}`.toUpperCase() || 'US'
}

function EditarPerfil() {
  const { estado, perfil, actualizarPerfilLocal } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('violeta')

  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const [errores, setErrores] = useState<ErroresFormulario>({})

  useEffect(() => {
    if (perfil) {
      setFirstName(perfil.firstName)
      setLastName(perfil.lastName)
      setUsername(perfil.username)
      setEmail(perfil.email)
      setAvatar(perfil.avatar || 'violeta')
    }
  }, [perfil])

  const hayErrores = Boolean(errores.firstName || errores.lastName || errores.username || errores.email || errores.general)

  const tituloActual = guardadoExitoso
    ? 'Perfil actualizado'
    : hayErrores
      ? 'No pudimos guardar los cambios'
      : 'Editar perfil'

  useTituloPagina(tituloActual)

  if (estado === 'cargando' || !perfil) {
    return <EstadoCargando />
  }

  // Pantalla de Éxito según el prototipo de Figma
  if (guardadoExitoso) {
    return (
      <section aria-labelledby="titulo-exito-perfil" className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <h1
          id="titulo-exito-perfil"
          tabIndex={-1}
          className="text-3xl font-bold tracking-tight text-texto outline-none"
        >
          Perfil actualizado
        </h1>

        <div className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8">
          <h2 className="text-xl font-bold text-texto">Perfil actualizado</h2>

          <Alerta tipo="exito">Tus cambios ya están guardados.</Alerta>

          <Boton to="/perfil" variante="primario">
            Continuar
          </Boton>
        </div>
      </section>
    )
  }

  function validarLocalmente(): ErroresFormulario {
    const nuevos: ErroresFormulario = {}
    if (firstName.trim().length < 2) {
      nuevos.firstName = 'Escribe al menos 2 caracteres para tus nombres.'
    }
    if (lastName.trim().length < 2) {
      nuevos.lastName = 'Escribe al menos 2 caracteres para tus apellidos.'
    }
    const userLimpio = username.trim().toLowerCase()
    if (!/^[a-z0-9._]{3,20}$/.test(userLimpio)) {
      nuevos.username = 'Usa entre 3 y 20 caracteres (letras, números, punto o guion bajo).'
    }
    const correoLimpio = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      nuevos.email = 'Escribe un correo electrónico válido.'
    }
    return nuevos
  }

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!perfil || guardando) return

    const validacion = validarLocalmente()
    if (Object.keys(validacion).length > 0) {
      setErrores(validacion)
      return
    }

    setGuardando(true)
    setErrores({})

    try {
      const actualizado = await actualizarMiPerfil(
        { firstName, lastName, username, email, avatar },
        perfil,
      )
      actualizarPerfilLocal(actualizado)
      setGuardadoExitoso(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const nuevosErrores: ErroresFormulario = {}
        if (err.codigo === CODIGO_USERNAME_OCUPADO) {
          nuevosErrores.username = 'Este nombre ya está en uso.'
        }
        if (err.codigo === CODIGO_CORREO_OCUPADO) {
          nuevosErrores.email = 'Este correo ya está registrado.'
        }
        if (err.campos) {
          if (err.campos.username) nuevosErrores.username = err.campos.username
          if (err.campos.email || err.campos.correo) {
            nuevosErrores.email = err.campos.email ?? err.campos.correo
          }
          if (err.campos.firstName || err.campos.nombres) {
            nuevosErrores.firstName = err.campos.firstName ?? err.campos.nombres
          }
          if (err.campos.lastName || err.campos.apellidos) {
            nuevosErrores.lastName = err.campos.lastName ?? err.campos.apellidos
          }
        }
        if (Object.keys(nuevosErrores).length === 0) {
          nuevosErrores.general = err.message
        }
        setErrores(nuevosErrores)
      } else {
        setErrores({ general: 'No pudimos guardar los cambios. Inténtalo de nuevo.' })
      }
    } finally {
      setGuardando(false)
    }
  }

  const inicialesPreview = obtenerIniciales(firstName, lastName)

  return (
    <section aria-labelledby="titulo-editar-perfil" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1
        id="titulo-editar-perfil"
        tabIndex={-1}
        className="text-3xl font-bold tracking-tight text-texto outline-none"
      >
        {tituloActual}
      </h1>

      <form
        onSubmit={(e) => {
          void manejarSubmit(e)
        }}
        noValidate
        className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold text-texto">{hayErrores ? 'Revisa los datos' : 'Tu información'}</h2>

        {errores.general && <Alerta tipo="error">{errores.general}</Alerta>}

        <CampoTexto
          id="nombres"
          etiqueta="Nombres"
          valor={firstName}
          onChange={(v) => {
            setFirstName(v)
            if (errores.firstName) setErrores((prev) => ({ ...prev, firstName: undefined }))
          }}
          error={errores.firstName}
          autoComplete="given-name"
          maxLength={60}
        />

        <CampoTexto
          id="apellidos"
          etiqueta="Apellidos"
          valor={lastName}
          onChange={(v) => {
            setLastName(v)
            if (errores.lastName) setErrores((prev) => ({ ...prev, lastName: undefined }))
          }}
          error={errores.lastName}
          autoComplete="family-name"
          maxLength={60}
        />

        <CampoTexto
          id="username"
          etiqueta="Nombre de usuario"
          valor={username}
          onChange={(v) => {
            setUsername(v)
            if (errores.username) setErrores((prev) => ({ ...prev, username: undefined }))
          }}
          error={errores.username}
          autoComplete="username"
          maxLength={20}
        />

        <CampoTexto
          id="correo"
          etiqueta="Correo"
          tipo="email"
          inputMode="email"
          valor={email}
          onChange={(v) => {
            setEmail(v)
            if (errores.email) setErrores((prev) => ({ ...prev, email: undefined }))
          }}
          error={errores.email}
          autoComplete="email"
          maxLength={100}
        />

        <SelectorAvatar valor={avatar} onChange={setAvatar} iniciales={inicialesPreview} />

        <div className="mt-2 flex flex-col gap-3">
          <Boton type="submit" variante="primario" cargando={guardando}>
            {hayErrores ? 'Corregir' : 'Guardar cambios'}
          </Boton>
          <Boton to="/perfil" variante="texto">
            Cancelar
          </Boton>
        </div>
      </form>
    </section>
  )
}

export default EditarPerfil