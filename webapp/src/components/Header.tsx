import './Header.css'
import { useAuth } from '../utils/AuthProvider'
import { Link, Typography } from '@material-ui/core'

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

  // TODO use AppBar instead
  return (
    <header className="page-header d-flex justify-content-between">
      <Typography variant={'h4'}>
        <Link href={'/'} underline={'none'}>
          Workplace Reservation
        </Link>
      </Typography>
      {showLogoutButton && (
        <button className={'btn btn-primary m-2'} onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  )
}
