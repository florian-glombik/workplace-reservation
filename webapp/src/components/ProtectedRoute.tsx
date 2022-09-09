import { Navigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthProvider'

export const ProtectedRoute = ({ children }: any) => {
  //@ts-ignore
  const userIsAuthenticated = useAuth().user
  if (!userIsAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}
