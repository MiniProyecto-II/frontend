import { useEffect } from 'react'

const PRODUCTO = 'Salón de Estudio'

/** Pone el título de la pestaña con el formato «Nombre de la pantalla · Salón de Estudio». */
export function useTituloPagina(nombre: string) {
  useEffect(() => {
    document.title = `${nombre} · ${PRODUCTO}`
  }, [nombre])
}
