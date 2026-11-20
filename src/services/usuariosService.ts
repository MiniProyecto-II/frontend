import { ApiError, peticion } from './api'
import {
  RUTA_ACTUALIZAR_PERFIL,
  RUTA_COMPLETAR_GOOGLE,
  RUTA_MI_PERFIL,
  RUTA_REGISTRO,
  esRespuestaPerfil,
  normalizarPerfil,
  type CuerpoActualizarPerfil,
  type CuerpoCompletarGoogle,
  type CuerpoRegistro,
  type Perfil,
} from './contrato'

/** Guarda el perfil por API. La cuenta ya fue creada con Firebase Authentication. */
export async function registrarUsuario(cuerpo: CuerpoRegistro, signal?: AbortSignal): Promise<void> {
  await peticion(RUTA_REGISTRO, {
    metodo: 'POST', autenticada: true, signal,
    cuerpo: { nombres: cuerpo.firstName, apellidos: cuerpo.lastName, username: cuerpo.username, avatar: cuerpo.avatar },
  })
}

export async function comprobarUsername(username: string): Promise<void> {
  const respuesta = await peticion(`/api/v1/users/check-username/${encodeURIComponent(username)}`) as { data?: { available?: boolean } }
  if (typeof respuesta.data?.available !== 'boolean') throw new ApiError('La respuesta del servidor no tiene el formato esperado.')
  if (!respuesta.data.available) throw new ApiError('Ese nombre de usuario ya está en uso. Prueba con otro.', 409, 'USERNAME_TAKEN')
}

/**
 * Perfil de la persona con sesión. Devuelve `null` si todavía no tiene perfil completo
 * (caso Google sin username: la API responde 403 o 404).
 */
export async function obtenerMiPerfil(signal?: AbortSignal): Promise<Perfil | null> {
  try {
    const respuesta = await peticion(RUTA_MI_PERFIL, { autenticada: true, signal })
    if (!esRespuestaPerfil(respuesta)) {
      throw new ApiError('La respuesta del servidor no tiene el formato esperado.')
    }
    return normalizarPerfil(respuesta.data)
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) return null
    throw err
  }
}

/** Termina el registro con Google guardando el username elegido. */
export async function completarPerfilGoogle(datos: CuerpoCompletarGoogle, signal?: AbortSignal): Promise<void> {
  const cuerpo = datos
  await peticion(RUTA_COMPLETAR_GOOGLE, { metodo: 'POST', cuerpo, autenticada: true, signal })
}

/** Actualiza el perfil del usuario autenticado (US-04). */
export async function actualizarMiPerfil(
  datos: CuerpoActualizarPerfil,
  perfilActual: Perfil,
  signal?: AbortSignal,
): Promise<Perfil> {
  const usernameLimpio = datos.username.trim().toLowerCase()
  const correoLimpio = datos.email.trim().toLowerCase()

  // Modo simulación mientras Backend publica PATCH /api/v1/users/me
  if (import.meta.env.VITE_USAR_MOCKS === 'true') {
    await new Promise((r) => setTimeout(r, 500))
    const camposError: Record<string, string> = {}
    if (usernameLimpio !== perfilActual.username && (usernameLimpio === 'andrea' || usernameLimpio === 'admin')) {
      camposError.username = 'Este nombre ya está en uso.'
    }
    if (correoLimpio !== perfilActual.email.toLowerCase() && correoLimpio === 'andrea@correounivalle.edu.co') {
      camposError.email = 'Este correo ya está registrado.'
    }
    if (Object.keys(camposError).length > 0) {
      throw new ApiError('No pudimos guardar los cambios. Revisa los datos.', 409, 'DUPLICATE_DATA', camposError)
    }
    return {
      ...perfilActual,
      firstName: datos.firstName.trim(),
      lastName: datos.lastName.trim(),
      username: usernameLimpio,
      email: correoLimpio,
      avatar: datos.avatar,
    }
  }

  const respuesta = await peticion(RUTA_ACTUALIZAR_PERFIL, {
    metodo: 'PATCH',
    autenticada: true,
    signal,
    cuerpo: {
      nombres: datos.firstName.trim(),
      apellidos: datos.lastName.trim(),
      username: usernameLimpio,
      email: correoLimpio,
      avatar: datos.avatar,
    },
  })

  if (esRespuestaPerfil(respuesta)) {
    return normalizarPerfil(respuesta.data)
  }

  return {
    ...perfilActual,
    firstName: datos.firstName.trim(),
    lastName: datos.lastName.trim(),
    username: usernameLimpio,
    email: correoLimpio,
    avatar: datos.avatar,
  }
}