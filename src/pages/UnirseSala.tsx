import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Unirse a una sala'

function UnirseSala() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default UnirseSala
