export interface OpcionAvatar {
  id: string
  nombre: string
  clase: string
}

/** Avatares disponibles (paleta predefinida). La API guarda solo el `id`. */
export const AVATARES: OpcionAvatar[] = [
  { id: 'violeta', nombre: 'violeta', clase: 'bg-primario-activo' },
  { id: 'azul', nombre: 'azul', clase: 'bg-sky-700' },
  { id: 'verde', nombre: 'verde', clase: 'bg-emerald-700' },
  { id: 'ambar', nombre: 'ámbar', clase: 'bg-amber-700' },
  { id: 'rosa', nombre: 'rosa', clase: 'bg-rose-700' },
  { id: 'turquesa', nombre: 'turquesa', clase: 'bg-teal-700' },
]

export function opcionAvatar(id: string | undefined): OpcionAvatar {
  return AVATARES.find((a) => a.id === id) ?? AVATARES[0]
}

interface Props {
  iniciales: string
  avatar?: string
  tamano?: 'md' | 'lg'
}

/** Círculo de color con las iniciales de la persona. Decorativo: el nombre ya está escrito al lado. */
function AvatarIniciales({ iniciales, avatar, tamano = 'md' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${
        tamano === 'lg' ? 'size-14 text-lg' : 'size-9 text-sm'
      } ${opcionAvatar(avatar).clase}`}
    >
      {iniciales}
    </span>
  )
}

export default AvatarIniciales
