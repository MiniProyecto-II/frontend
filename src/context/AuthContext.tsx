import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError } from '../services/api'
import type { CuerpoRegistro, Perfil } from '../services/contrato'
import { auth } from '../services/firebase'
import {
  completarPerfilGoogle,
  obtenerMiPerfil,
  registrarUsuario,
} from '../services/usuariosService'

/**
 * - cargando: aún se está comprobando si hay sesión.
 * - anonimo: sin sesión.
 * - sin-username: entró con Google pero falta elegir el username (no puede ver rutas privadas).
 * - autenticado: sesión y perfil completos.
 * - error: hay sesión de Firebase pero la API no respondió (se ofrece reintentar).
 */
export type EstadoSesion = 'cargando' | 'anonimo' | 'sin-username' | 'autenticado' | 'error'

/** Por qué falló un ingreso, para que cada pantalla muestre el mensaje adecuado. */
export type TipoErrorAuth = 'credenciales' | 'cancelado' | 'otro'

export class ErrorAuth extends Error {
  readonly tipo: TipoErrorAuth

  constructor(mensaje: string, tipo: TipoErrorAuth) {
    super(mensaje)
    this.name = 'ErrorAuth'
    this.tipo = tipo
  }
}

export interface DatosAuth {
  nombre: string | null
  correo: string | null
}

export interface DatosRegistro {
  nombres: string
  apellidos: string
  username: string
  avatar: string
  correo: string
  contrasena: string
}

export interface AuthValor {
  estado: EstadoSesion
  perfil: Perfil | null
  /** Datos de la cuenta de Firebase (útil cuando aún no hay perfil, p. ej. Google sin username). */
  datosAuth: DatosAuth | null
  errorSesion: string | null
  iniciarConGoogle: () => Promise<void>
  registrar: (datos: DatosRegistro) => Promise<void>
  completarPerfil: (username: string) => Promise<void>
  cerrarSesion: () => Promise<void>
  reintentarSesion: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthValor | null>(null)

const MENSAJE_SIN_FIREBASE =
  'La aplicación no está configurada para iniciar sesión todavía. Avisa al equipo de desarrollo.'

function traducirErrorFirebase(err: unknown): Error {
  if (err instanceof ApiError || err instanceof ErrorAuth) return err
  const codigo = typeof err === 'object' && err !== null ? (err as { code?: unknown }).code : undefined
  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
    case 'auth/missing-password':
      return new ErrorAuth('Correo o contraseña incorrectos.', 'credenciales')
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return new ErrorAuth('Cerraste el acceso de Google. Puedes volver a intentarlo.', 'cancelado')
    case 'auth/popup-blocked':
      return new ErrorAuth(
        'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.',
        'otro',
      )
    case 'auth/network-request-failed':
      return new ErrorAuth('No hay conexión. Revisa tu internet e inténtalo de nuevo.', 'otro')
    case 'auth/too-many-requests':
      return new ErrorAuth('Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.', 'otro')
    case 'auth/user-disabled':
      return new ErrorAuth('Esta cuenta está deshabilitada. Contacta al equipo del Salón de Estudio.', 'otro')
    default:
      return new ErrorAuth('No pudimos iniciar sesión. Inténtalo de nuevo en un momento.', 'otro')
  }
}

function datosDe(usuario: User): DatosAuth {
  return { nombre: usuario.displayName, correo: usuario.email }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>(auth ? 'cargando' : 'anonimo')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [datosAuth, setDatosAuth] = useState<DatosAuth | null>(null)
  const [errorSesion, setErrorSesion] = useState<string | null>(null)

  // Evita que una respuesta lenta pise a una más reciente.
  const secuencia = useRef(0)
  // Mientras una acción (login, registro, Google) controla el flujo, el listener no sincroniza por su cuenta.
  const accionEnCurso = useRef(false)

  const limpiar = useCallback(() => {
    setPerfil(null)
    setDatosAuth(null)
    setErrorSesion(null)
    setEstado('anonimo')
  }, [])

  const descartarSesion = useCallback(async () => {
    secuencia.current += 1
    if (auth) await signOut(auth).catch(() => undefined)
    limpiar()
  }, [limpiar])

  /** Pide el perfil a la API y fija el estado de la sesión. Lanza si la API falla. */
  const sincronizar = useCallback(
    async (usuario: User | null) => {
      const mia = ++secuencia.current
      if (!usuario) {
        limpiar()
        return
      }
      try {
        const datos = await obtenerMiPerfil()
        if (mia !== secuencia.current) return
        setDatosAuth(datosDe(usuario))
        setPerfil(datos)
        setErrorSesion(null)
        setEstado(datos ? 'autenticado' : 'sin-username')
      } catch (err) {
        if (mia !== secuencia.current) return
        if (err instanceof ApiError && err.status === 401) {
          await descartarSesion()
        } else {
          setDatosAuth(datosDe(usuario))
          setPerfil(null)
          setErrorSesion(err instanceof Error ? err.message : 'No pudimos cargar tu sesión.')
          setEstado('error')
        }
        throw err
      }
    },
    [descartarSesion, limpiar],
  )

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (usuario) => {
      if (accionEnCurso.current) return
      sincronizar(usuario).catch(() => undefined)
    })
  }, [sincronizar])

  /** Ejecuta una acción de ingreso; si algo falla después de entrar, no deja una sesión a medias. */
  const ejecutarIngreso = useCallback(
    async (accion: () => Promise<User>) => {
      if (!auth) throw new ErrorAuth(MENSAJE_SIN_FIREBASE, 'otro')
      accionEnCurso.current = true
      try {
        const usuario = await accion()
        await sincronizar(usuario)
      } catch (err) {
        await descartarSesion()
        throw traducirErrorFirebase(err)
      } finally {
        accionEnCurso.current = false
      }
    },
    [descartarSesion, sincronizar],
  )

  const iniciarConGoogle = useCallback(
    () =>
      ejecutarIngreso(async () => {
        const proveedor = new GoogleAuthProvider()
        proveedor.setCustomParameters({ prompt: 'select_account' })
        const credencial = await signInWithPopup(auth!, proveedor)
        return credencial.user
      }),
    [ejecutarIngreso],
  )

  const registrar = useCallback(
    async (datos: DatosRegistro) => {
      if (!auth) throw new ErrorAuth(MENSAJE_SIN_FIREBASE, 'otro')
      const cuerpo: CuerpoRegistro = {
        firstName: datos.nombres.trim(),
        lastName: datos.apellidos.trim(),
        username: datos.username.trim().toLowerCase(),
        avatar: datos.avatar,
        email: datos.correo.trim(),
        password: datos.contrasena,
      }
      // 1) La API crea la cuenta y valida unicidad (si falla, el error llega al formulario tal cual).
      await registrarUsuario(cuerpo)
      // 2) Con la cuenta creada, se inicia sesión para entrar directo al panel.
      try {
        await ejecutarIngreso(async () => {
          const credencial = await signInWithEmailAndPassword(auth!, cuerpo.email, cuerpo.password)
          return credencial.user
        })
      } catch {
        throw new ErrorAuth(
          'Tu cuenta se creó, pero no pudimos iniciar sesión automáticamente. Entra desde «Iniciar sesión».',
          'otro',
        )
      }
    },
    [ejecutarIngreso],
  )

  const completarPerfil = useCallback(
    async (username: string) => {
      await completarPerfilGoogle(username.trim().toLowerCase())
      await sincronizar(auth?.currentUser ?? null)
    },
    [sincronizar],
  )

  const cerrarSesion = useCallback(async () => {
    await descartarSesion()
  }, [descartarSesion])

  const reintentarSesion = useCallback(async () => {
    setEstado('cargando')
    await sincronizar(auth?.currentUser ?? null).catch(() => undefined)
  }, [sincronizar])

  const valor = useMemo<AuthValor>(
    () => ({
      estado,
      perfil,
      datosAuth,
      errorSesion,
      iniciarConGoogle,
      registrar,
      completarPerfil,
      cerrarSesion,
      reintentarSesion,
    }),
    [
      estado,
      perfil,
      datosAuth,
      errorSesion,
      iniciarConGoogle,
      registrar,
      completarPerfil,
      cerrarSesion,
      reintentarSesion,
    ],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
