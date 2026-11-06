import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Crear una sala'

function CrearSala() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default CrearSala
