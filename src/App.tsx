import DatoBaseTecnica from './components/DatoBaseTecnica'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-4xl font-bold text-indigo-600">Salón de Estudio</h1>
        <p className="mt-4 text-slate-600">
          La base técnica de la aplicación está en construcción.
        </p>
        <DatoBaseTecnica />
      </section>
    </main>
  )
}

export default App
