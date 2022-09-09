import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './LocalStorageUtil'
import { NullString } from '../components/Workplaces'

//@ts-ignore
const AuthContext = createContext()

export type Account = {
  id: string
  email: string
  username: NullString
  firstName: NullString
  lastName: NullString
}

export const AuthProvider = ({ children }: any) => {
  const [jwtToken, setJwtToken] = useLocalStorage('jwtToken', null)
  const [user, setUser] = useLocalStorage('user', null)
  const navigate = useNavigate()

  const login = async (jwtToken: string, user: Account) => {
    setJwtToken(jwtToken)
    setUser(user)
    navigate('/', { replace: true })
  }

  const logout = () => {
    setJwtToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }

  const value = useMemo(
    () => ({
      jwtToken: jwtToken,
      user: user,
      login,
      logout,
      setUser,
    }),
    [jwtToken, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
