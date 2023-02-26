import { Box, Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Office } from '../components/offices/OfficeList'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useAuth } from '../utils/AuthProvider'
import { EditOffice } from '../components/offices/EditOffice'

export function EditOfficePage() {
  const { officeId } = useParams()
  const { jwtToken } = useAuth()
  const [office, setOffice] = useState<Office | undefined>()

  useEffect(() => {
    loadOffice()
  }, [])

  const loadOffice = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToke  n,
      },
    }

    try {
      let requestUrl = BASE_URL + `offices/${officeId}`
      const office: Office = (await axios.get(requestUrl, requestConfig)).data
      setOffice(office)
    } catch (error: any) {
      console.log(error)
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Stack sx={{ m: 2 }} spacing={3}>
      <Typography variant={'h4'}>Edit office: {office?.Name.String}</Typography>
      <EditOffice office={office} />
    </Stack>
  )
}
