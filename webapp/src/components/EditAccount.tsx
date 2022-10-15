import './Login.css'
import { useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import Button from '@mui/material/Button'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { Account, useAuth } from '../utils/AuthProvider'

export const EditAccount = () => {
  // @ts-ignore
  const { jwtToken, user, setUser } = useAuth()
  const [noChangesMade, setNoChangesMade] = useState(true)
  const [details, setDetails] = useState({
    id: user.id,
    email: user.email,
    username: user.username.String,
  })

  // const initialValues: Account = {
  //   id: user.id,
  //   email: user.email,
  //   username: user.username,
  //   role: user.role,
  // }

  const updateChangesMade = () => {
    console.log('----------')
    console.log(user.username.String)
    console.log(details.username)
    setNoChangesMade(
      user.username == details.username && user.email == details.username
    )
    console.log({ noChangesMade })
  }

  const saveChanges = async (e: any) => {
    e.preventDefault() // page shall not re-render

    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const updatedUser = (
        await axios.patch(BASE_URL + 'users/edit', details, requestConfig)
      ).data
      setUser(updatedUser)
      setNoChangesMade(true)
      toast.success('The account was successfully updated!')
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box>
        <form onSubmit={saveChanges}>
          <h1>Edit Account</h1>
          <Box mt={2}>
            <TextField
              label={'Username'}
              variant={'outlined'}
              onChange={(e) => {
                setDetails({ ...details, username: e.target.value })
                updateChangesMade()
                console.log('current value', e.target.value)
              }}
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
