import { useAuth } from '../../utils/AuthProvider'
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { NullString, WorkplaceWithoutReservations } from '../Workplaces'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { TableHead, TableRow } from '@material-ui/core'
import { useNavigate } from 'react-router-dom'

export type Office = {
  ID: string
  Name: NullString
  Description: NullString
  Location: string
  LocationUrl?: NullString
  workplaces: WorkplaceWithoutReservations[]
}

export function OfficeList() {
  const { jwtToken } = useAuth()
  const [offices, setOffices] = useState<Office[]>([])
  const navigate = useNavigate()

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
      const requestUrl = BASE_URL + 'offices'
      const offices = (await axios.get(requestUrl, requestConfig)).data
      setOffices(offices ?? [])
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  const handleEditOffice = (office: Office) => {
    navigate(`${office.ID}`)
  }

  const handleDeleteOffice = async (office: Office) => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }
    try {
      const requestUrl = BASE_URL + 'offices/' + office.ID
      await axios.delete(requestUrl, requestConfig)

      setOffices(
        offices.filter((officeInList) => officeInList.ID !== office.ID)
      )
      toast.success(`Office ${office.ID} was deleted`)
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  const noOfficeLoaded = offices.length == 0
  return (
    <Box>
      {!noOfficeLoaded && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Workplace</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offices.map((office: Office) => {
              return (
                <TableRow key={office.ID}>
                  <TableCell>{office.Name.String}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditOffice(office)}
                      aria-label="edit office"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteOffice(office)}
                      aria-label="delete office"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      {noOfficeLoaded && <Typography>No offices created yet</Typography>}
    </Box>
  )
}
