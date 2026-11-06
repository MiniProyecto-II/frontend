import { useBaseTecnica } from '../hooks/useBaseTecnica'

function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleString('es')
}

// Estados 'cargando' y 'error' provisionales: se diseñan en FE-04.
function DatoBaseTecnica() {
  const { data, status, error } = useBaseTecnica()

  if (status === 'cargando') {
    return <p className="mt-6 text-slate-500">Cargando…</p>
  }

  if (status === 'error') {
    return <p className="mt-6 text-red-600">Error: {error}</p>
  }

  return (
    <div className="mt-6 rounded-lg bg-indigo-50 p-4">
      <p className="text-lg font-medium text-slate-800">{data?.mensaje}</p>
      {data && (
        <p className="mt-2 text-sm text-slate-500">
          Actualizado: {formatearFecha(data.actualizadoEn)}
        </p>
      )}
    </div>
  )
}

export default DatoBaseTecnica
