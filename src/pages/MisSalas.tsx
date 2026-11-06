import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Mis salas'

function MisSalas() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default MisSalas
