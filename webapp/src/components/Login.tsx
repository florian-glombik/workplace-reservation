import './Login.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import { BASE_URL } from '../config'
import Button from '@mui/material/Button'
import { Box, TextField } from '@material-ui/core'

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
    setSuccess(true)

    setErrMsg('there is an error')

    const jwtToken = await axios.get(BASE_URL + 'login')
    console.log(jwtToken.data)
    login({ user: 'test' })
  }

  return (
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
  )
}
