import { Navigate } from 'react-router-dom'
import { isAdmin, useAuth } from '../utils/AuthProvider'
// @ts-ignore
import jwt_decode from 'jwt-decode'
import { isBefore } from 'date-fns'

type JwtToken = {
  id: string
  userId: string
  issuedAt: Date
  expiredAt: Date
}

function convertJwtToken(token: string): JwtToken | null {
  let convertedToken: any
  try {
    convertedToken = jwt_decode(token)
  } catch (error) {
    return null
  }

  return {
    id: convertedToken.id,
    userId: convertedToken.userId,
    issuedAt: new Date(convertedToken.issuedAt),
    expiredAt: new Date(convertedToken.expiredAt),
  }
}

export const ProtectedRoute = ({
  children,
  isAdminRoute,
}: {
  children: any
  isAdminRoute?: boolean
}) => {
  const { user, jwtToken, logout } = useAuth()

  const convertedToken: JwtToken | null = convertJwtToken(jwtToken)

  const userIsAuthenticated =
    user && convertedToken && isBefore(Date.now(), convertedToken.expiredAt)
  if (!userIsAuthenticated) {
    logout()
    return <Navigate to="/login" />
  }
  if (isAdminRoute && !isAdmin(user)) {
    return <Navigate to={'/'} />
  }
  return children
}
