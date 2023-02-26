import { useAuth } from '../../utils/AuthProvider'
import { Box, Button, Card, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { NullString, WorkplaceWithoutReservations } from '../Workplaces'
import { EditOffice } from './EditOffice'

export type Office = {
  ID: string
  Name: NullString
  Description: NullString
  location: string
  locationURL?: string
  workplaces: WorkplaceWithoutReservations[]
}

export function OfficeList() {
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
      let requestUrl = BASE_URL + 'offices'

      const offices = (await axios.get(requestUrl, requestConfig)).data
      console.log({ offices })

      setOffices(offices ?? [])
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  const noOfficeLoaded = offices.length == 0
  return (
    <Box>
      {noOfficeLoaded && <Typography>No offices created yet</Typography>}
      {offices.map((office) => {
        return <Office office={office} key={`office-${office.ID}`} />
      })}
    </Box>
  )
}

function Office({ office }: { office: Office }) {
  const [displayEditForm, setDisplayEditForm] = useState(false)

  const handleDelete = () => {
    // TODO
  }
  const handleEdit = () => {
    setDisplayEditForm(!displayEditForm)
  }

  const closeEdit = () => {
    setDisplayEditForm(false)
  }

  return (
    <Card sx={{ mb: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant={'h5'}>{office.Name.String}</Typography>
        <Box>
          <Button onClick={handleEdit}>Edit</Button>
          <Button disabled={true} onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      </Box>
      {displayEditForm && <EditOffice office={office} closeEdit={closeEdit} />}
    </Card>
  )
}
