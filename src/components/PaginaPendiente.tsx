import type { ReactNode } from 'react'

interface Props {
  titulo: string
  children?: ReactNode
}

/** Contenido provisional de una pantalla que se implementa en un sprint posterior. */
function PaginaPendiente({ titulo, children }: Props) {
  return (
    <>
      <h1 tabIndex={-1} className="text-3xl font-bold wrap-break-word text-texto sm:text-4xl">{titulo}</h1>
      <p className="mt-3 text-texto-suave">Esta pantalla se implementa en un sprint posterior.</p>
      {children}
    </>
  )
}

export default PaginaPendiente
