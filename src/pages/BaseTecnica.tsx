import DatoBaseTecnica from '../components/DatoBaseTecnica'
import { useTituloPagina } from '../hooks/useTituloPagina'

const TITULO = 'Base técnica'

function BaseTecnica() {
  useTituloPagina(TITULO)
  return (
    <div className="mx-auto max-w-xl">
      <h1 tabIndex={-1} className="text-3xl font-bold text-texto sm:text-4xl">{TITULO}</h1>
      <p className="mt-3 text-texto-suave">
        La base técnica de la aplicación está en construcción.
      </p>
      <DatoBaseTecnica />
    </div>
  )
}

export default BaseTecnica
