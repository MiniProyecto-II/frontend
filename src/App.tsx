import DatoBaseTecnica from './components/DatoBaseTecnica'

function App() {
  return (
    <main className="flex min-h-screen justify-center bg-fondo px-4 py-10 sm:items-center sm:py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-texto sm:text-4xl">Salón de Estudio</h1>
        <p className="mt-3 text-texto-suave">
          La base técnica de la aplicación está en construcción.
        </p>
        <DatoBaseTecnica />
      </div>
    </main>
  )
}

export default App
