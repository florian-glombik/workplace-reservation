import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './LocalStorageUtil'
import { NullString } from '../components/Workplaces'
import jwtDecode from 'jwt-decode'

//@ts-ignore
const AuthContext = createContext()

export type Token = {
  id: string
  issuedAt: Date
  expiredAt: Date
  userId: string
  role: Role
}

export type Account = {
  id: string
  email: string
  username: NullString
  role: Role
}

export type Role = 'user' | 'admin'

export const AuthProvider = ({ children }: any) => {
  const [jwtToken, setJwtToken] = useLocalStorage('jwtToken', null)
  const [user, setUser] = useLocalStorage('user', null)
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false)
  const navigate = useNavigate()

  const login = async (jwtToken: string, user: Account) => {
    setJwtToken(jwtToken)

    const decodedToken = jwtDecode(jwtToken) as Token
    user.id = decodedToken.userId
    user.role = decodedToken.role

    setUser(user)
    setIsAdmin(isLoggedInUserAdmin())

    navigate('/', { replace: true })
  }

  const logout = () => {
    setJwtToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }

  function isLoggedInUserAdmin(): boolean {
    const decodedToken = jwtDecode(jwtToken) as Token
    return decodedToken.role === 'admin'
  }

  const value = useMemo(
    () => ({
      jwtToken: jwtToken,
      user: user,
      login,
      logout,
      setUser,
      isAdmin,
    }),
    [jwtToken, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
