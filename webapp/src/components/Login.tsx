import './Login.css'
import { useState } from 'react'
import { useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import { BASE_URL } from '../config'
import Button from '@mui/material/Button'
import { Box, TextField } from '@material-ui/core'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'

export const Login = () => {
  // @ts-ignore
  const { login } = useAuth()
  const [details, setDetails] = useState({ email: '', password: '' })

  const handleLogin = async (e: any) => {
    e.preventDefault() // page shall not re-render
    try {
      const response = await axios.post(BASE_URL + 'users/login', details)
      login(response.data.accessToken, response.data.user)
    } catch (error: any) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box>
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>
          <Box mt={2}>
            <TextField
              label={'E-Mail'}
              variant={'outlined'}
              onChange={(e) =>
                setDetails({ ...details, email: e.target.value })
              }
              fullWidth
              autoFocus
            />
          </Box>
          <Box mt={2}>
            <TextField
              label={'Password'}
              variant={'outlined'}
              onChange={(e) =>
                setDetails({ ...details, password: e.target.value })
              }
              fullWidth
              type={'password'}
            />
          </Box>
          <Box mt={2} mb={3}>
            <Button type="submit" variant={'contained'}>
              Login
            </Button>
          </Box>
        </form>
        <a href={'registration'} className={'line'}>
          Don't have an account? Register
        </a>
      </Box>
    </Box>
  )
}
