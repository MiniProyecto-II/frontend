import { useParams } from 'react-router-dom'
import PaginaPendiente from '../components/PaginaPendiente'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Sala'

function Sala() {
  const { id } = useParams()
  useTituloPagina(TITULO)
  return (
    <PaginaPendiente titulo={TITULO}>
      <p className="mt-6 text-texto">
        ID de la sala: <span className="font-semibold wrap-break-word">{id}</span>
      </p>
    </PaginaPendiente>
  )
}

export default Sala
