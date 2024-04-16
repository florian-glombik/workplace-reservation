import { Box, Divider, Stack, Typography } from '@mui/material'
import { CreateOrEditOffice } from '../components/offices/CreateOrEditOffice'
import { OfficeList } from '../components/offices/OfficeList'
import { USER_MANAGEMENT_MENU_ENTRY } from '../components/Header'
import { useState } from 'react'
import { Account, useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import { composeServerUrl } from '../utils/accessServer'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'

export function UsersPage() {
  const { jwtToken, isAdmin } = useAuth()
  const [availableUsers, setAvailableUsers] = useState<Account[]>([])

  const loadUsers = async () => {
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const availableUsersResponse = await axios.get(
        composeServerUrl('users/all-available'),
        requestConfig
      )
      setAvailableUsers(availableUsersResponse.data)
    } catch (error) {
      toast.error('Could not load users: ' + getDisplayResponseMessage(error))
    }
  }

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        {USER_MANAGEMENT_MENU_ENTRY}
      </Typography>

      <Stack spacing={6}>
        <CreateOrEditOffice />
        <Divider />
        <OfficeList />
      </Stack>
    </Box>
  )
}
