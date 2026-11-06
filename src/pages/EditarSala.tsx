import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Editar sala'

function EditarSala() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default EditarSala
