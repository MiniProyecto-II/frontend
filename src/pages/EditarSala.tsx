import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import Alerta from '../components/Alerta'
import Boton from '../components/Boton'
import CampoTexto from '../components/CampoTexto'
import EstadoCargando from '../components/EstadoCargando'
import { useAuth } from '../hooks/useAuth'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { ApiError } from '../services/api'
import type { SalaEstudio } from '../services/contrato'
const claveSalaSimulada = (uid: string, id: string) =>
  `salon_estudio_editar_sala_simulada:${uid}:${id}`

interface ErroresFormulario {
  name?: string
  general?: string
}


function EditarSala() {
  const { estado, perfil } = useAuth()
  const { id = '' } = useParams()
  const [sala, setSala] = useState<SalaEstudio | null>(null)
  const [cargandoSala, setCargandoSala] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  const [errores, setErrores] = useState<ErroresFormulario>({})

  useEffect(() => {
    if (!perfil || !id) {
      setSala(null)
      setErrorCarga('No pudimos identificar la sala o la sesión.')
      setCargandoSala(false)
      return
    }
    setErrorCarga(null)
    setGuardadoExitoso(false)
    setErrores({})
    // Simulación temporal de esta pantalla, independiente de la API de salas.
    let nombre = 'Sala de estudio'
    try {
      nombre = localStorage.getItem(claveSalaSimulada(perfil.uid, id)) || nombre
    } catch {
      // Se puede mostrar el formulario aunque el almacenamiento esté bloqueado.
    }
    setSala({
      id,
      nombre,
      anfitrionUid: perfil.uid,
      anfitrionUsername: perfil.username,
      esAnfitrion: true,
      participantes: [],
    })
    setName(nombre)
    setCargandoSala(false)
  }, [id, perfil?.uid])

  const hayErrores = Boolean(errores.name || errores.general)

  const tituloActual = guardadoExitoso
    ? 'Sala actualizada'
    : hayErrores
      ? 'No pudimos guardar los cambios'
      : 'Editar sala'

  useTituloPagina(tituloActual) 
  

  if (estado === 'cargando' || cargandoSala) {
    return <EstadoCargando />
  }

  if (errorCarga || !sala) {
    return <Alerta tipo="error">{errorCarga ?? 'No pudimos cargar la sala.'}</Alerta>
  }

  // Pantalla de Éxito según el prototipo de Figma
  if (guardadoExitoso) {
    return (
      
      <section aria-labelledby="titulo-exito-sala" className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <h1
          id="titulo-exito-sala"
          tabIndex={-1}
          className="text-3xl font-bold tracking-tight text-texto outline-none"
        >
          Sala actualizada
        </h1>

        <div className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8">
          <h2 className="text-xl font-bold text-texto">Sala actualizada</h2>

          <Alerta tipo="exito">Tus cambios de prueba se guardaron en este navegador.</Alerta>

          <Boton to="/salas" variante="primario">
            Continuar
          </Boton>
        </div>
      </section>
    )
  }

  function validarLocalmente(): ErroresFormulario {
    const nuevos: ErroresFormulario = {}
    if (name.trim().length < 2) {
      nuevos.name = 'Escribe al menos 2 caracteres para el nombre de la sala.'
    }
    return nuevos
  }

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!sala || guardando) return

    const validacion = validarLocalmente()
    if (Object.keys(validacion).length > 0) {
      setErrores(validacion)
      return
    }

    setGuardando(true)
    setErrores({})

    try {
      const actualizado = { ...sala, nombre: name.trim() }
      localStorage.setItem(claveSalaSimulada(sala.anfitrionUid, sala.id), actualizado.nombre)
      setSala(actualizado)
      setGuardadoExitoso(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const nuevosErrores: ErroresFormulario = {}
        
        if (err.campos) {
          if (err.campos.name) nuevosErrores.name = err.campos.name
          
        }
        if (Object.keys(nuevosErrores).length === 0) {
          nuevosErrores.general = err.message
        }
        setErrores(nuevosErrores)
      } else {
        setErrores({ general: 'No pudimos guardar los cambios. Inténtalo de nuevo.' })
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-editar-perfil" className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1
        id="titulo-editar-perfil"
        tabIndex={-1}
        className="text-3xl font-bold tracking-tight text-texto outline-none"
      >
        {tituloActual}
      </h1>

      <form
        onSubmit={(e) => {
          void manejarSubmit(e)
        }}
        noValidate
        className="flex flex-col gap-5 rounded-2xl border border-borde bg-superficie p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold text-texto">{hayErrores ? 'Revisa los datos' : 'Editar sala'}</h2>

        {errores.general && <Alerta tipo="error">{errores.general}</Alerta>}

        <CampoTexto
          id="sala"
          valor={name}
          etiqueta="Nombre de la sala"
          onChange={(v) => {
            setName(v)
            if (errores.name) setErrores((prev) => ({ ...prev, name: undefined }))
          }}
          error={errores.name}
          maxLength={60}
        />
        
        <div className="mt-2 flex flex-col gap-3">
          <Boton type="submit" variante="primario" cargando={guardando}>
            {hayErrores ? 'Corregir' : 'Guardar cambios'}
          </Boton>
          <Boton to="/SalaEstudio" variante="texto">
            Cancelar
          </Boton>
        </div>
      </form>
    </section>
  )
}

export default EditarSala
