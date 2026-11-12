import type { ReactNode } from 'react'

interface Props {
  titulo: string
  subtitulo?: string
  children: ReactNode
}

/** Tarjeta de formulario de las pantallas de acceso. El título es el único <h1> de la página. */
function TarjetaAuth({ titulo, subtitulo, children }: Props) {
  return (
    <section className="w-full rounded-2xl border border-borde bg-superficie p-6 sm:p-8">
      <h1 tabIndex={-1} className="text-2xl font-bold wrap-break-word text-texto">
        {titulo}
      </h1>
      {subtitulo && <p className="mt-2 text-sm text-texto-suave">{subtitulo}</p>}
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </section>
  )
}

export default TarjetaAuth
