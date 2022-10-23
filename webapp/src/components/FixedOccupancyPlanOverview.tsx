import './Login.css'
import { useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import Button from '@mui/material/Button'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useAuth } from '../utils/AuthProvider'
import { Typography } from '@mui/material'

export const FixedOccupancyPlanOverview = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Typography>TODO</Typography>
    </Box>
  )
}
