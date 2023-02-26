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

export type Office = {
  ID: string
  Name: NullString
  Description: NullString
  location: string
  locationURL?: string
  workplaces: WorkplaceWithoutReservations[]
}

export function OfficeList() {
  const { jwtToken, user } = useAuth()
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

  const handleEdit = () => {}

  const handleDelete = () => {
    // TODO
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
                    <IconButton onClick={handleEdit} aria-label="edit office">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      disabled={true}
                      onClick={handleDelete}
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
