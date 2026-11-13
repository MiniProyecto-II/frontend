const PARTICIPANTES = ['VG', 'AC', 'JM', 'SL']

/** Panel de presentación de las pantallas de acceso. Es decorativo: la vista previa se oculta a los lectores de pantalla. */
function HeroAuth() {
  return (
    <div className="hidden flex-col gap-6 lg:flex">
      <p className="text-xs font-semibold tracking-wider text-acento uppercase">Tu grupo. Tu espacio.</p>
      <p className="text-4xl leading-tight font-bold text-texto">
        Las grandes ideas
        <br />
        se construyen juntos.
      </p>
      <p className="max-w-md text-texto-suave">Un lugar para estudiar, conversar y compartir lo que sabes.</p>

      <div aria-hidden="true" className="flex max-w-md flex-col gap-4 rounded-2xl border border-borde bg-superficie p-5">
        <p className="font-semibold text-texto"># cálculo · estudiando juntos</p>
        <div className="flex gap-3">
          {PARTICIPANTES.map((p) => (
            <span
              key={p}
              className="flex size-12 items-center justify-center rounded-full bg-nav-activo text-sm font-bold text-texto"
            >
              {p}
            </span>
          ))}
        </div>
        <p className="text-sm text-texto-suave">
          <span className="mr-2">Andrea</span>¿Revisamos el segundo ejercicio?
        </p>
        <p className="rounded-lg bg-exito-tenue px-3 py-2 text-sm text-exito">4 estudiantes · Una misma meta</p>
      </div>

      <p className="text-sm text-texto-suave">Privado para tu equipo. Fácil de retomar.</p>
    </div>
  )
}

export default HeroAuth
