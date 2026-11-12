import { AVATARES } from './AvatarIniciales'

interface Props {
  valor: string
  onChange: (id: string) => void
  iniciales: string
}

/** Grupo de opciones (radio): se maneja con flechas, y cada opción se lee como «Avatar <color>». */
function SelectorAvatar({ valor, onChange, iniciales }: Props) {
  const elegido = AVATARES.find((a) => a.id === valor) ?? AVATARES[0]

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-xs font-semibold tracking-wider text-texto-suave uppercase">Avatar</legend>
      <div className="flex flex-wrap gap-3">
        {AVATARES.map((opcion) => (
          <label key={opcion.id} className="relative cursor-pointer">
            <input
              type="radio"
              name="avatar"
              value={opcion.id}
              checked={opcion.id === elegido.id}
              onChange={() => onChange(opcion.id)}
              className="peer sr-only"
            />
            <span className="sr-only">Avatar {opcion.nombre}</span>
            <span
              aria-hidden="true"
              className={`flex size-12 items-center justify-center rounded-full text-sm font-bold text-white ring-offset-2 ring-offset-superficie transition-shadow duration-150 peer-checked:ring-2 peer-checked:ring-acento peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-acento ${opcion.clase}`}
            >
              {iniciales}
            </span>
          </label>
        ))}
      </div>
      <p className="text-sm text-texto-suave">
        {iniciales} · avatar {elegido.nombre} seleccionado
      </p>
    </fieldset>
  )
}

export default SelectorAvatar
