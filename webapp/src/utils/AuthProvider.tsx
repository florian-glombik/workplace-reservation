import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './LocalStorageUtil'
import { NullString } from '../components/Workplaces'
import jwtDecode from 'jwt-decode'
import axios from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from './NotificationUtil'

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

export function isAdmin(user: Account): boolean {
  return user.role === 'admin'
}

export const AuthProvider = ({ children }: any) => {
  const [jwtToken, setJwtToken] = useLocalStorage('jwtToken', null)
  const [user, setUser] = useLocalStorage('user', null)
  const [availableUsers, setAvailableUsers] = useLocalStorage(
    'availableUsers',
    null
  )
  const navigate = useNavigate()

  const login = async (jwtToken: string, user: Account) => {
    setJwtToken(jwtToken)

    const decodedToken = jwtDecode(jwtToken) as Token
    user.id = decodedToken.userId
    user.role = decodedToken.role

    setUser(user)

    if (isAdmin(user)) {
      await loadUsers(jwtToken)
    }
    navigate('/', { replace: true })
  }

  async function loadUsers(jwtToken: string) {
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const availableUsersResponse = await axios.get(
        BASE_URL + 'users/all-available',
        requestConfig
      )
      setAvailableUsers(availableUsersResponse.data)
    } catch (error) {
      toast.error('Could not load users: ' + getDisplayResponseMessage(error))
    }
  }

  const logout = () => {
    setJwtToken(null)
    setUser(null)
    setAvailableUsers(null)
    navigate('/login', { replace: true })
  }

  const value = useMemo(
    () => ({
      jwtToken: jwtToken,
      user: user,
      availableUsers: availableUsers,
      login,
      logout,
      setUser,
    }),
    [jwtToken, user, availableUsers]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
