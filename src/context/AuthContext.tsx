import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth'
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError } from '../services/api'
import type { Perfil } from '../services/contrato'
import { auth } from '../services/firebase'
import {
  obtenerMiPerfil,
} from '../services/usuariosService'

/**
 * - cargando: aún se está comprobando si hay sesión.
 * - anonimo: sin sesión.
 * - sin-username: entró con Google pero falta elegir el username (no puede ver rutas privadas).
 * - autenticado: sesión y perfil completos.
 * - error: hay sesión de Firebase pero la API no respondió (se ofrece reintentar).
 */
export type EstadoSesion = 'cargando' | 'anonimo' | 'sin-username' | 'autenticado' | 'error'

export interface DatosAuth {
  nombre: string | null
  correo: string | null
}

export interface AuthValor {
  estado: EstadoSesion
  perfil: Perfil | null
  /** Datos de la cuenta de Firebase (útil cuando aún no hay perfil, p. ej. Google sin username). */
  datosAuth: DatosAuth | null
  errorSesion: string | null
  reintentarSesion: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthValor | null>(null)

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
      sincronizar(usuario).catch(() => undefined)
    })
  }, [sincronizar])

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
      reintentarSesion,
    }),
    [
      estado,
      perfil,
      datosAuth,
      errorSesion,
      reintentarSesion,
    ],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
