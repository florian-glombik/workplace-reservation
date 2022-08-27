import './Login.css'
import { useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import Button from '@mui/material/Button'
import axios from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'

export const Registration = () => {
  const [details, setDetails] = useState({
    username: 'sf',
    firstName: 'sdf',
    lastName: 'df',
    password: 'sdf',
    email: 'sdsdff@sdf.de',
  })

  // "username": "abc",
  //   "firstName": "Test",
  //   "lastName": "LastName",
  //   "password": "test",
  //   "email": "test+3@test.de"

  const handleRegistration = async (e: any) => {
    e.preventDefault() // page shall not re-render

    setDetails({
      username: 'sf',
      firstName: 'sdf',
      lastName: 'df',
      password: 'sdf',
      email: 'sdsdff@sdf.de',
    })

    let response
    try {
      response = await axios.post(BASE_URL + 'users', details)
      console.log(response)
    } catch (error: any) {
      console.log(error)
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    toast.success('The account was successfully created!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
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
              fullWidth
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
              Register
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}
