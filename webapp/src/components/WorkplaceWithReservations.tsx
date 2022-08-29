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
import { useEffect, useState } from 'react'
import startOfWeek from 'date-fns/startOfWeek'
import { addDays, endOfWeek } from 'date-fns'

export type WorkplaceWithReservations = {
  id: string
  name?: string
  description?: string
  reservations: Reservation[] | null | undefined
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

const weekStartsOnMonday = { weekStartsOn: 1 }

export const Workplaces = () => {
  // @ts-ignore
  const token = useAuth().jwtToken

  const [today] = useState(Date.now())
  //@ts-ignore
  const startOfTheWeek = startOfWeek(today, weekStartsOnMonday)
  //@ts-ignore
  const endOfTheWeek = endOfWeek(today, weekStartsOnMonday)

  const [workplaces1, setWorkplaces1] = useState<WorkplaceWithReservations[]>(
    []
  )

  useEffect(() => {
    console.log(loadWorkplaces())
  }, [])

  const loadWorkplaces = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        start: startOfTheWeek.toISOString(),
        end: endOfTheWeek.toISOString(),
      },
    }

    await axios
      .get(BASE_URL + 'workplaces', requestConfig)
      .then((response) => response.data)
      .then((data) => {
        console.log(JSON.stringify(data))
        setWorkplaces1(data)
      })
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  let reservations: Reservation[] = []

  let workplaces: WorkplaceWithReservations[] = [
    {
      id: 'id1',
      name: 'ubuntu',
      reservations: [],
    },
    {
      id: 'id2',
      name: 'mint',
      reservations: null,
    },
  ]

  const logWorkplaces = () => {
    console.log({ workplaces1 })
    console.log({ workplaces })
  }

  return (
    <div>
      <Button onClick={loadWorkplaces}>LoadWorkplaces</Button>
      <Button onClick={logWorkplaces}>Show Workplaces</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Weekday</TableCell>
            {workplaces.map((workplace) => (
              <TableCell key={`workplace-${workplace.id}`}>
                {workplace.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {weekDays.map((day, index) => {
            const currentDay = addDays(startOfTheWeek, index)

            return (
              <TableRow key={`worplace-reservations-${day}`}>
                <TableCell>{currentDay.getDate()}</TableCell>
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
