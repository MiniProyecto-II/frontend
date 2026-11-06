import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Crear cuenta'

function Registro() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default Registro
