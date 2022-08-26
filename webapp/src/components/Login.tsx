import './Login.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import { BASE_URL } from '../config'
import Button from '@mui/material/Button'
import { Box, TextField } from '@material-ui/core'
import { toast } from 'react-toastify'

const logLogin = (details: any) => {
  console.log(details)
}

export const Login = () => {
  // @ts-ignore
  const { login } = useAuth()
  const [details, setDetails] = useState({ email: '', password: '' })

  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setErrMsg('')
  }, [user, password])

  const handleLogin = async (e: any) => {
    e.preventDefault() // page shall not re-render
    logLogin(details)

    try {
      const response = await axios.post(BASE_URL + 'users/login', details)
      console.log(response)

      login({ user: 'test' })
    } catch (error: any) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }

    // login({ user: 'test' })
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box>
          <form onSubmit={handleLogin}>
            <p>{errMsg}</p>
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
    </div>
  )
}
