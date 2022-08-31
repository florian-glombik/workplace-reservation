import './Header.css'
import { useAuth } from '../utils/AuthProvider'
import { Box, Button, Link, Typography } from '@material-ui/core'

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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        bgcolor: 'text.disabled',
      }}
    >
      <Box sx={{ m: 2 }}>
        <Typography variant={'h4'}>
          <Link href={'/'} underline={'none'}>
            Workplace Manager
          </Link>
        </Typography>
      </Box>
      {showLogoutButton && (
        <Box sx={{ m: 2 }}>
          <Button variant={'contained'} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      )}
    </Box>
  )
}
