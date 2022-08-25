import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './LocalStorageUtil'

//@ts-ignore
const AuthContext = createContext()

export const AuthProvider = ({ children }: any) => {
  const [jwtToken, setJwtToken] = useLocalStorage('jwtToken', null)
  const navigate = useNavigate()

  const login = async (data: any) => {
    setJwtToken(data)
    navigate('/', { replace: true })
  }

  const logout = () => {
    setJwtToken(null)
    navigate('/login', { replace: true })
  }

  const value = useMemo(
    () => ({
      user: jwtToken,
      login,
      logout,
    }),
    [jwtToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
