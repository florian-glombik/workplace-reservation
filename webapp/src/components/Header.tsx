import './Header.css'
import { useAuth } from '../utils/AuthProvider'
import { Box, Button, Link, Typography } from '@material-ui/core'
import {
  AppBar,
  FormControlLabel,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Toolbar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { AccountCircle } from '@mui/icons-material'
import { useRef, useState } from 'react'

type HeaderProps = {
  showLogoutButton?: boolean
}

export const Header = (props: HeaderProps) => {
  //@ts-ignore
  const { logout, user } = useAuth()
  const { showLogoutButton = true } = props
  const [anchorEl, setAnchorEl] = useState(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setAuth(event.target.checked);
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    //@ts-ignore
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant={'h6'} component={'div'}>
            Workplace Manager
          </Typography>
          {!!user && (
            <div>
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
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
