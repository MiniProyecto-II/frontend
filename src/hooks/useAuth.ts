import { useContext } from 'react'
import { AuthContext, type AuthValor } from '../context/AuthContext'

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return valor
}
