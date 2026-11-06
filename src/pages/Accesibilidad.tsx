import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Accesibilidad'

function Accesibilidad() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default Accesibilidad
