/** Reglas de los formularios de registro. Los mensajes dicen cómo corregir el dato. */

export const REGLA_CONTRASENA = 'Al menos 8 caracteres, mayúscula, minúscula y número.'
export const REGLA_USERNAME = 'Entre 3 y 20 caracteres: letras, números, punto o guion bajo.'

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FORMATO_USERNAME = /^[a-zA-Z0-9._]{3,20}$/

const dominio = import.meta.env.VITE_DOMINIO_CORREO?.trim().toLowerCase().replace(/^@/, '') ?? ''

export function validarTextoObligatorio(valor: string, etiqueta: string): string | null {
  return valor.trim() === '' ? `Escribe tus ${etiqueta}.` : null
}

export function validarUsername(valor: string): string | null {
  const v = valor.trim()
  if (v === '') return 'Elige un nombre de usuario.'
  if (!FORMATO_USERNAME.test(v)) return `Nombre de usuario no válido. ${REGLA_USERNAME}`
  return null
}

export function validarCorreo(valor: string): string | null {
  const v = valor.trim()
  if (v === '') return 'Escribe tu correo institucional.'
  if (!FORMATO_CORREO.test(v)) return 'Escribe un correo institucional válido.'
  if (dominio && !v.toLowerCase().endsWith(`@${dominio}`)) {
    return `Usa tu correo institucional (termina en @${dominio}).`
  }
  return null
}

export function validarContrasena(valor: string): string | null {
  if (valor === '') return 'Escribe una contraseña.'
  const cumple = valor.length >= 8 && /[A-ZÁÉÍÓÚÑ]/.test(valor) && /[a-záéíóúñ]/.test(valor) && /\d/.test(valor)
  return cumple ? null : `Usa al menos 8 caracteres, mayúscula, minúscula y número.`
}

export function iniciales(nombres: string, apellidos = ''): string {
  const a = nombres.trim().charAt(0)
  const b = apellidos.trim().charAt(0)
  return (a + b).toUpperCase() || 'SE'
}
