const CLAVE = 'ruta-pendiente'

/** Solo rutas internas: evita redirecciones a otros sitios. */
function esRutaInterna(ruta: string): boolean {
  return ruta.startsWith('/') && !ruta.startsWith('//')
}

/** Guarda la ruta privada que la persona intentó abrir sin sesión. */
export function guardarRutaPendiente(ruta: string): void {
  if (!esRutaInterna(ruta)) return
  try {
    sessionStorage.setItem(CLAVE, ruta)
  } catch {
    // Sin almacenamiento disponible: se vuelve al panel por defecto.
  }
}

/** Lee la ruta pendiente sin borrarla (es seguro llamarla en cada render) o devuelve la ruta por defecto. */
export function leerRutaPendiente(porDefecto = '/salas'): string {
  try {
    const ruta = sessionStorage.getItem(CLAVE)
    if (ruta && esRutaInterna(ruta) && ruta !== '/ingreso' && !ruta.startsWith('/registro')) return ruta
  } catch {
    // Ignorar: se usa la ruta por defecto.
  }
  return porDefecto
}

/** Borra la ruta pendiente cuando ya se llegó a ella. */
export function limpiarRutaPendiente(): void {
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {
    // Ignorar.
  }
}
