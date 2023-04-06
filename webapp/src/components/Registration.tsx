import { useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import Button from '@mui/material/Button'
import axios from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useNavigate } from 'react-router-dom'

export const Registration = () => {
  const [details, setDetails] = useState({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    email: '',
  })

  const navigate = useNavigate()

  const handleRegistration = async (e: any) => {
    e.preventDefault() // page shall not re-render

    try {
      await axios.post(BASE_URL + 'users', details)
    } catch (error: any) {
      toast.error(getDisplayResponseMessage(error))
      return
    }

    toast.success('The account was successfully created!')
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box>
        <form onSubmit={handleRegistration}>
          <h1>Registration</h1>
          <Box mt={2}>
            <TextField
              label={'Username'}
              variant={'outlined'}
              onChange={(e) =>
                setDetails({ ...details, username: e.target.value })
              }
              fullWidth
              autoFocus
            />
          </Box>
          <Box mt={2}>
            <TextField
              label={'E-Mail'}
              variant={'outlined'}
              onChange={(e) =>
                setDetails({ ...details, email: e.target.value })
              }
              type={'email'}
              fullWidth
              required
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
              required
              inputProps={{ minLength: 3 }}
            />
          </Box>
          <Box mt={2} mb={3}>
            <Button type="submit" variant={'contained'}>
              Register
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}
