import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { useAuth } from '../utils/AuthProvider'

export type Workplace = {
  id: string
  name?: string
  reservations: Reservation[]
  office?: Office
  description?: string
}

export type Reservation = {
  id: string
  user: User
  start: string
  end: string
}

export type Office = {
  id: string
  name?: string
  description?: string
}

export type User = {
  id: string
  name: string
}

const weekDays: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const Workplaces = () => {
  // @ts-ignore
  const token = useAuth().jwtToken

  let workplaces: Workplace[] = [
    {
      id: 'id1',
      name: 'ubuntu',
      reservations: [],
    },
    {
      id: 'id2',
      name: 'mint',
      reservations: [],
    },
  ]

  const loadWorkplaces = async (e: any) => {
    e.preventDefault()

    let data = {
      start: '2022-08-22T22:36:40+00:00',
      end: '2022-09-22T22:36:40+00:00',
    }
    let config: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: data,
    }

    try {
      let response = await axios.get(
        BASE_URL + 'workplace/reservations',
        config
      )

      console.log({ response })
    } catch (error: any) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <div>
      <Button onClick={loadWorkplaces}>LoadWorkplaces</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Weekday</TableCell>
            {workplaces.map((workplace) => (
              <TableCell key={`workplace-${workplace.id}`}>
                {workplace.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {weekDays.map((day) => {
            return (
              <TableRow key={`worplace-reservations-${day}`}>
                <TableCell>{day}</TableCell>
                {workplaces.map((workplace) => (
                  <TableCell key={`reservation-${day}-${workplace.id}`}>
                    <Button variant={'contained'}>{workplace.id}</Button>
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
