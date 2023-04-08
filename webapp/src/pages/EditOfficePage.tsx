import { Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Office } from '../components/offices/OfficeList'
import axios, { AxiosRequestConfig } from 'axios'
import { SERVER_BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useAuth } from '../utils/AuthProvider'
import { CreateOrEditOffice } from '../components/offices/CreateOrEditOffice'
import { WorkplaceWithoutReservations } from '../components/Workplace'

export type OfficeWithWorkplaces = {
  Office: Office
  Workplaces?: WorkplaceWithoutReservations[]
}

export function EditOfficePage() {
  const { officeId } = useParams()
  const { jwtToken } = useAuth()
  const [officeWithWorkplaces, setOfficeWithWorkplaces] = useState<
    OfficeWithWorkplaces | undefined
  >()

  useEffect(() => {
    loadOffice()
  }, [])

  const loadOffice = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      let requestUrl = SERVER_BASE_URL + `offices/${officeId}`
      const officeWithWorkplaces: OfficeWithWorkplaces = (
        await axios.get(requestUrl, requestConfig)
      ).data
      setOfficeWithWorkplaces(officeWithWorkplaces)
    } catch (error: any) {
      console.log(error)
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Stack sx={{ m: 2 }} spacing={3}>
      <Typography variant={'h4'}>
        Edit office: {officeWithWorkplaces?.Office.Name.String}
      </Typography>
      <CreateOrEditOffice officeWithWorkplaces={officeWithWorkplaces} />
    </Stack>
  )
}
