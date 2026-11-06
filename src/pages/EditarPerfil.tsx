import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Editar perfil'

function EditarPerfil() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default EditarPerfil
