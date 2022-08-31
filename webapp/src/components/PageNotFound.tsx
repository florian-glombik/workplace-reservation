import './Login.css'
import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export const PageNotFound = () => {
  const navigate = useNavigate()

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
        <Typography variant={'h4'}>Page not found</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </Box>
    </Box>
  )
}
