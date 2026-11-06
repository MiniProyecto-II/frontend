import type { MouseEvent } from 'react'

/**
 * Primer elemento enfocable de la página. Oculto visualmente hasta recibir foco.
 * Se maneja con onClick porque el router puede interferir con los enlaces de ancla.
 */
function SaltarAlContenido() {
  const alActivar = (evento: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById('contenido')
    if (!main) return
    evento.preventDefault()
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    main.focus({ preventScroll: true })
    main.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <a
      href="#contenido"
      onClick={alActivar}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-lg focus:bg-primario focus:px-6 focus:font-semibold focus:text-texto focus:shadow-lg"
    >
      Saltar al contenido
    </a>
  )
}

export default SaltarAlContenido
