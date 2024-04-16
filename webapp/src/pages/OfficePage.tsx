import { Box, Divider, Stack, Typography } from '@mui/material'
import { CreateOrEditOffice } from '../components/offices/CreateOrEditOffice'
import { Office, OfficeList } from '../components/offices/OfficeList'
import { OFFICE_MENU_ENTRY } from '../components/Header'
import { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { composeServerUrl } from '../utils/accessServer'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useAuth } from '../utils/AuthProvider'

export function OfficePage() {
  const { jwtToken } = useAuth()
  const [offices, setOffices] = useState<Office[]>([])

  useEffect(() => {
    loadOffices()
  }, [])

  const loadOffices = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const requestUrl = composeServerUrl('offices')
      const offices = (await axios.get(requestUrl, requestConfig)).data
      setOffices(offices ?? [])
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        {OFFICE_MENU_ENTRY}
      </Typography>

      <Stack spacing={6}>
        <CreateOrEditOffice offices={offices} setOffices={setOffices} />
        <Divider />
        <OfficeList offices={offices} setOffices={setOffices} />
      </Stack>
    </Box>
  )
}
