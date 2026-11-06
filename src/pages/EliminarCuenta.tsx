import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Eliminar cuenta'

function EliminarCuenta() {
  useTituloPagina(TITULO)
  return <PaginaPendiente titulo={TITULO} />
}

export default EliminarCuenta
