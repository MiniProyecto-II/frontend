import { Navigate, createBrowserRouter } from 'react-router-dom'
import LayoutAuth from '../layouts/LayoutAuth'
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
import { RutaCompletarPerfil, RutaPrivada, RutaSoloInvitados } from './guardas'

export const router = createBrowserRouter([
  {
    // Pantallas de acceso: solo para quien no tiene sesión
    element: <LayoutAuth />,
    children: [
      {
        element: <RutaSoloInvitados />,
        children: [
          { path: '/registro', element: <Registro /> },
        ],
      },
      {
        // Entró con Google y falta elegir el username
        element: <RutaCompletarPerfil />,
        children: [
          { path: '/registro/usuario', element: <RegistroUsuario /> },
          // Nombre alterno que usa el backlog (SCRUM-289)
          { path: '/completar-perfil', element: <Navigate to="/registro/usuario" replace /> },
        ],
      },
    ],
  },
  {
    // Pantallas públicas
    element: <LayoutPublico />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/ingreso', element: <Ingreso /> },
      { path: '/base-tecnica', element: <BaseTecnica /> },
      { path: '/accesibilidad', element: <Accesibilidad /> },
      // Página de apoyo (404)
      { path: '*', element: <NoEncontrada /> },
    ],
  },
  {
    // Pantallas privadas: sin sesión se redirige al ingreso
    element: <RutaPrivada />,
    children: [
      {
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
    ],
  },
])
