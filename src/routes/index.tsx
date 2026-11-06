import { createBrowserRouter } from 'react-router-dom'
import LayoutPrivado from '../layouts/LayoutPrivado'
import LayoutPublico from '../layouts/LayoutPublico'
import Accesibilidad from '../pages/Accesibilidad'
import BaseTecnica from '../pages/BaseTecnica'
import CrearSala from '../pages/CrearSala'
import EditarPerfil from '../pages/EditarPerfil'
import EditarSala from '../pages/EditarSala'
import EliminarCuenta from '../pages/EliminarCuenta'
import Ingreso from '../pages/Ingreso'
import Inicio from '../pages/Inicio'
import MisSalas from '../pages/MisSalas'
import NoEncontrada from '../pages/NoEncontrada'
import Perfil from '../pages/Perfil'
import Registro from '../pages/Registro'
import RegistroUsuario from '../pages/RegistroUsuario'
import Sala from '../pages/Sala'
import UnirseSala from '../pages/UnirseSala'

export const router = createBrowserRouter([
  {
    // Pantallas públicas
    element: <LayoutPublico />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/ingreso', element: <Ingreso /> },
      { path: '/registro', element: <Registro /> },
      { path: '/registro/usuario', element: <RegistroUsuario /> },
      { path: '/base-tecnica', element: <BaseTecnica /> },
      { path: '/accesibilidad', element: <Accesibilidad /> },
      // Página de apoyo (404)
      { path: '*', element: <NoEncontrada /> },
    ],
  },
  {
    // Pantallas privadas
    // PENDIENTE: proteger rutas privadas en el Sprint 1
    element: <LayoutPrivado />,
    children: [
      { path: '/salas', element: <MisSalas /> },
      { path: '/salas/crear', element: <CrearSala /> },
      { path: '/salas/unirse', element: <UnirseSala /> },
      { path: '/salas/:id', element: <Sala /> },
      { path: '/salas/:id/editar', element: <EditarSala /> },
      { path: '/perfil', element: <Perfil /> },
      { path: '/perfil/editar', element: <EditarPerfil /> },
      { path: '/perfil/eliminar', element: <EliminarCuenta /> },
    ],
  },
])
