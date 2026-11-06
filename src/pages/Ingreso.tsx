import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Iniciar sesión'

function Ingreso() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default Ingreso
