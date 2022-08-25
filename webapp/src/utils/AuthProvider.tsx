import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './LocalStorageUtil'

const AuthContext = createContext({ user: null })

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useLocalStorage('user', null)
  const navigate = useNavigate()

  // call this function when you want to authenticate the user
  const login = async (data: any) => {
    setUser(data)
    navigate('/')
  }

  // call this function to sign out logged in user
  const logout = () => {
    setUser(null)
    navigate('/login', { replace: true })
  }

  const value: any = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
