import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Se guarda fuera del componente para que cambiar entre el layout público y el
// privado (que se montan de nuevo) no se confunda con la primera carga.
let rutaAnterior: string | null = null

/**
 * En cada cambio de ruta (no en la primera carga) lleva el scroll al inicio y
 * mueve el foco al <h1> de la nueva página, para que el lector de pantalla lo anuncie.
 */
export function useFocoAlNavegar() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (rutaAnterior === null || rutaAnterior === pathname) {
      rutaAnterior = pathname
      return
    }
    rutaAnterior = pathname

    window.scrollTo(0, 0)
    const titulo = document.querySelector<HTMLHeadingElement>('main h1')
    titulo?.focus({ preventScroll: true })
  }, [pathname])
}
