import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Un último paso'

function RegistroUsuario() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default RegistroUsuario
