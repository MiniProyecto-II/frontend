import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Mi perfil'

function Perfil() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default Perfil
