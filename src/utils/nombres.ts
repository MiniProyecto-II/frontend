/** Iniciales a partir de un nombre completo: «Veronica Granados» → «VG». */
export function inicialesDeNombre(nombre: string | null | undefined): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'SE'
  const primera = partes[0].charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return (primera + ultima).toUpperCase()
}

/** Sugerencia de username a partir del correo (la persona puede cambiarla). */
export function sugerirUsername(correo: string | null | undefined): string {
  const local = (correo ?? '').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '')
  const recortado = local.slice(0, 20)
  return recortado.length >= 3 ? recortado : ''
}
