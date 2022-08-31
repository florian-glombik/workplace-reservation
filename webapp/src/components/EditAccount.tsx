import './Login.css'
import { useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import Button from '@mui/material/Button'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useNavigate } from 'react-router-dom'
import { Account, useAuth } from '../utils/AuthProvider'

export const EditAccount = () => {
  const navigate = useNavigate()
  // @ts-ignore
  const { jwtToken, user } = useAuth()
  const [noChangesMade, setNoChangesMade] = useState(true)
  const [details, setDetails] = useState({
    username: user.username,
    firstName: user.firstName.String,
    lastName: user.lastName.String,
    email: user.email,
  })

  const updateChangesMade = () => {
    setNoChangesMade(
      user.username == details.username || user.email == details.username
    )
  }

  const saveChanges = async (e: any) => {
    e.preventDefault() // page shall not re-render

    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    // TODO adjust request that is sent!

    try {
      await axios.patch(BASE_URL + 'users/edit', details, requestConfig)
    } catch (error: any) {
      toast.error(getDisplayResponseMessage(error))
      return
    }

    toast.success('The account was successfully updated!')
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box>
        <form onSubmit={saveChanges} onChange={updateChangesMade}>
          <h1>Edit Account</h1>
          <Box mt={2}>
            <TextField
              label={'Username'}
              variant={'outlined'}
              onChange={(e) =>
                setDetails({ ...details, username: e.target.value })
              }
              fullWidth
              defaultValue={details.username}
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
              defaultValue={details.email}
              required
            />
          </Box>
          <Box mt={2} mb={3}>
            <Button
              type="submit"
              variant={'contained'}
              disabled={noChangesMade}
            >
              Save changes
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}
