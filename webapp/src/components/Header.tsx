import './Header.css'
import { useAuth } from '../utils/AuthProvider'

export const Header = () => {
  //@ts-ignore
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="page-header d-flex justify-content-between">
      <h1>Workplace Reservation</h1>
      <button className={'btn btn-primary m-2'} onClick={handleLogout}>
        Logout
      </button>
    </header>
  )
}
