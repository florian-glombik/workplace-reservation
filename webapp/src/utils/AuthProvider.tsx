import { createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './LocalStorageUtil'
import { NullString } from '../components/Workplace'
import jwtDecode from 'jwt-decode'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from './NotificationUtil'
import { composeServerUrl } from './accessServer'

const DEFAULT_USER: Account = {
  id: '',
  email: '',
  username: {
    String: '',
    Valid: false,
  },
  role: 'notAuthenticated',
  accessGranted: false,
}

// TODO use Redux store instead
const AuthContext = createContext<AuthContextType>({
  jwtToken: '',
  user: DEFAULT_USER,
  availableUsers: [],
  isAdmin: false,
  login: () => {},
  logout: () => {},
  setUser: () => {},
})

type AuthContextType = {
  jwtToken: string
  user: Account
  isAdmin: boolean
  availableUsers: Account[]
  login: (jwtToken: string, user: Account) => void
  logout: () => void
  setUser: (user: Account) => void
}

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
  accessGranted: boolean
}

export type Role = 'user' | 'admin' | 'notAuthenticated'

function checkIsAdmin(user: Account): boolean {
  return user.role === 'admin'
}

export const AuthProvider = ({ children }: any) => {
  const [jwtToken, setJwtToken] = useLocalStorage('jwtToken', null)
  const [user, setUser] = useLocalStorage('user', null)
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false)
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

    const userIsAdmin = checkIsAdmin(user)
    setIsAdmin(userIsAdmin)
    if (userIsAdmin) {
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
        composeServerUrl('users/all-available'),
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
    setIsAdmin(false)
    setAvailableUsers(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{
        jwtToken: jwtToken,
        user: user,
        isAdmin: isAdmin,
        availableUsers: availableUsers,
        login: login,
        logout: logout,
        setUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
