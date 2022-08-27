import './Header.css'
import { useAuth } from '../utils/AuthProvider'

type HeaderProps = {
  showLogoutButton?: boolean
}

export const Header = (props: HeaderProps) => {
  //@ts-ignore
  const { logout } = useAuth()
  const { showLogoutButton = true } = props

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="page-header d-flex justify-content-between">
      <h1>Workplace Reservation</h1>
      {showLogoutButton && (
        <button className={'btn btn-primary m-2'} onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  )
}
