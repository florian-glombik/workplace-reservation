import { useState } from 'react'
import { useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import Button from '@mui/material/Button'
import { Box, TextField } from '@material-ui/core'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { composeServerUrl } from '../utils/accessServer'
import { Stack, Typography } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

const IS_DEMO_PAGE: boolean = process.env.REACT_APP_IS_DEMO_PAGE === 'true'

export const Login = () => {
  const { login } = useAuth()
  const [details, setDetails] = useState({ email: '', password: '' })

  const handleLogin = async (e: any) => {
    e.preventDefault() // page shall not re-render
    try {
      const response = await axios.post(
        composeServerUrl('users/login'),
        details
      )
      login(response.data.accessToken, response.data.user)
    } catch (error: any) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Stack>
        {IS_DEMO_PAGE && (
          <Box pb={4} pt={4}>
            <Typography variant={'h3'}>Workplace Reservation Demo</Typography>
            <Typography>
              Welcome to the demo page for the open-source project&nbsp;
              <span style={{ fontStyle: 'italic' }}>workplace-reservation</span>
              &nbsp;!
            </Typography>
            <Typography>
              This tool provides a solution to coordinate the workplace usage
              within your company by providing a simple desk booking system.
            </Typography>
            <Typography>
              To host your own (dockerized) instance, check out the&nbsp;
              <a
                href="https://github.com/florian-glombik/workplace-reservation"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repository. <GitHubIcon />
              </a>
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Stack minWidth={'20rem'}>
            <form onSubmit={handleLogin}>
              <Typography variant={'h4'}>Sign In</Typography>
              <Box mt={2}>
                <TextField
                  label={'E-Mail'}
                  variant={'outlined'}
                  onChange={(e) =>
                    setDetails({ ...details, email: e.target.value })
                  }
                  type={'email'}
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
                <Button type={'submit'} variant={'contained'}>
                  Login
                </Button>
              </Box>
            </form>
            <a href={'registration'} className={'line'}>
              Don't have an account? Register
            </a>
          </Stack>

          <Stack ml={8}>
            <Typography variant={'h5'}>Demo Users</Typography>
            <Typography component={'div'}>
              <ul>
                <li>
                  Normal User:
                  <ul>
                    <li>E-Mail: admin@workplace-reservation.de</li>
                    <li>Password: S9Ao6PAfh6qA8N</li>
                  </ul>
                </li>
                <li>
                  Admin User:
                  <ul>
                    <li>E-Mail: normalUser@workplace-reservation.de</li>
                    <li>Password: 649dWPVp9JJKLC</li>
                  </ul>
                </li>
              </ul>
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
