import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Inicio'

function Inicio() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default Inicio
