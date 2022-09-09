import './Header.css'
import { Account, useAuth } from '../utils/AuthProvider'
import { Box, Typography } from '@material-ui/core'
import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function getUserDisplayName(user: Account): string {
  return user.username.Valid && user.username.String != '' ? user.username.String : user.email
}

export const Header = () => {
  //@ts-ignore
  const { logout, user } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()

  const currentUrl = window.location.href

  const isLoggedIn = Boolean(user)
  const isLoginPage = currentUrl.includes('/login')

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    //@ts-ignore
    setAnchorEl(event.currentTarget)
  }

  const handleLogout = () => {
    logout()
    handleClose()
  }

  const handleEditAccount = () => {
    handleClose()
    navigate('/account/edit')
  }

  const handleReoccurringReservations = () => {
    handleClose()
    navigate('/reservations/reoccurring')
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Button
            variant={'outlined'}
            style={{ color: 'white' }}
            onClick={() => navigate('/')}
          >
            <Typography variant={'h6'}>Workplace Manager</Typography>
          </Button>
          {!isLoggedIn && !isLoginPage && (
            <Button
              variant={'outlined'}
              style={{ color: 'white' }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
          {isLoggedIn && (
            <Box sx={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography>
                {getUserDisplayName(user)}
              </Typography>
              <IconButton
                size='large'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleMenu}
                color='inherit'
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id='menu-appbar'
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                <MenuItem onClick={handleReoccurringReservations}>
                  Reoccurring Reservations
                </MenuItem>
                <MenuItem onClick={handleEditAccount}>Edit account</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
