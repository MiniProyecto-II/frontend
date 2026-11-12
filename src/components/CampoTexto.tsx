import type { HTMLInputTypeAttribute, ReactNode } from 'react'

interface Props {
  id: string
  etiqueta: string
  valor: string
  onChange: (valor: string) => void
  tipo?: HTMLInputTypeAttribute
  /** Mensaje de error junto al campo: dice qué pasó y cómo corregirlo. */
  error?: string | null
  /** Ayuda visible permanente (por ejemplo, la política de contraseña). */
  ayuda?: string
  autoComplete?: string
  inputMode?: 'text' | 'email'
  maxLength?: number
  /** Contenido extra bajo el error (p. ej. un enlace «Iniciar sesión»). */
  extra?: ReactNode
}

/** Campo con etiqueta siempre visible, ayuda y error asociados al input para el lector de pantalla. */
function CampoTexto({
  id,
  etiqueta,
  valor,
  onChange,
  tipo = 'text',
  error,
  ayuda,
  autoComplete,
  inputMode,
  maxLength,
  extra,
}: Props) {
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`
  const descritoPor = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wider text-texto-suave uppercase">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        spellCheck={false}
        autoCapitalize="none"
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor}
        className={`min-h-12 w-full rounded-lg border bg-barra px-4 text-texto transition-colors duration-150 placeholder:text-texto-suave/70 ${
          error ? 'border-error' : 'border-borde hover:border-texto-suave'
        }`}
      />
      {ayuda && (
        <p id={idAyuda} className="text-sm text-texto-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="text-sm text-error">
          {error}
        </p>
      )}
      {error && extra}
    </div>
  )
}

export default CampoTexto
