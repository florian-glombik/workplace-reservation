import './Header.css'
import { Account, isAdmin, useAuth } from '../utils/AuthProvider'
import { Box, Typography } from '@material-ui/core'
import {
  AppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
} from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GitHubIcon from '@mui/icons-material/GitHub'

export function getUserDisplayName(user?: Account): string {
  if (!user) {
    return ''
  }

  return user.username.Valid && user.username.String != ''
    ? user.username.String
    : user.email
}

const WORKPLACE_RESERVATION_BUG_OR_FEATURE_REQUEST_LINK =
  'https://github.com/florian-glombik/workplace-reservation/issues/new/choose'

export const Header = () => {
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

  const handleFixedOccupancySchedule = () => {
    handleClose()
    navigate('/fixed-occupancy-plan')
  }

  const handleRecurringReservations = () => {
    handleClose()
    navigate('/reservations/recurring')
  }

  const handleEditAccount = () => {
    handleClose()
    navigate('/account/edit')
  }

  const handleLinkToRepo = () => {
    handleClose()
    window.open(WORKPLACE_RESERVATION_BUG_OR_FEATURE_REQUEST_LINK)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Button
            variant={'outlined'}
            style={{ color: 'white' }}
            onClick={() => navigate('/')}
          >
            <Typography variant={'h6'}>Workplace Reservation</Typography>
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography>{getUserDisplayName(user!)}</Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
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
                {isAdmin(user!) && (
                  <MenuItem onClick={handleFixedOccupancySchedule} disabled>
                    Fixed occupancy schedule
                  </MenuItem>
                )}
                <MenuItem onClick={handleRecurringReservations}>
                  Recurring Reservations
                </MenuItem>
                <MenuItem onClick={handleEditAccount}>Edit account</MenuItem>
                <MenuItem onClick={handleLinkToRepo}>
                  Found a bug? &nbsp; <GitHubIcon />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
