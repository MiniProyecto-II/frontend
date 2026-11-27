import { useEffect, useState } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import Alerta from '../components/Alerta'
import EstadoCargando from '../components/EstadoCargando'
import { useAuth } from '../hooks/useAuth'
import type { SalaEstudio } from '../services/contrato'
import { obtenerSalaPorId } from '../services/salasService'

export default function RutaSoloAnfitrion() {
  const { id = '' } = useParams()
  const { estado, perfil } = useAuth()
  const uid = perfil?.uid

  const [sala, setSala] = useState<SalaEstudio | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    setSala(null)
    setError(null)
    setCargando(true)

    if (estado === 'cargando') {
      return () => controller.abort()
    }

    if (!uid || !id) {
      setCargando(false)
      return () => controller.abort()
    }

    obtenerSalaPorId(id, uid, controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) setSala(datos)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No pudimos cargar la sala.',
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })

    return () => controller.abort()
  }, [id, uid, estado])

  if (estado === 'cargando') return <EstadoCargando />

  if (!uid) return <Navigate to="/ingreso" replace />

  if (cargando) return <EstadoCargando />

  if (error || !sala) {
    return (
      <Alerta tipo="error">
        {error ?? 'Sala no encontrada.'}
      </Alerta>
    )
  }

  if (uid !== sala.anfitrionUid) {
    return (
      <Navigate
        to={`/salas/${encodeURIComponent(id)}`}
        replace
        state={{ aviso: 'Solo el anfitrión puede editar esta sala.' }}
      />
    )
  }

  return <Outlet />
}