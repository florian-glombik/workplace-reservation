import {
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
import {
  addDays,
  endOfDay,
  endOfWeek,
  isWithinInterval,
  startOfDay,
} from 'date-fns'
import { Button } from '@mui/material'

export type NullString = {
  String: string
  Valid: boolean
}

export type WorkplaceWithReservations = {
  id: string
  name: NullString
  description: NullString
  reservations: Reservation[] | null
}

export type Reservation = {
  ID: string
  StartDate: string
  EndDate: string
  ReservedWorkplaceId: string
  ReservingUserId: string
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
  // @ts-ignore
  const loggedInUser = useAuth().user

  const [today] = useState(Date.now())
  //@ts-ignore
  const startOfTheWeek = startOfWeek(today, weekStartsOnMonday)
  //@ts-ignore
  const endOfTheWeek = endOfWeek(today, weekStartsOnMonday)

  const [workplaces, setWorkplaces] = useState<WorkplaceWithReservations[]>([])

  useEffect(() => {
    updateWorkplaces()
  }, [])

  const updateWorkplaces = async () => {
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
      .then((data) => setWorkplaces(data))
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  const logWorkplaces = () => {
    console.log({ workplaces })
  }

  function isWorkplaceReserved(
    dayToCheck: Date,
    reservations: Reservation[] | null
  ): boolean {
    if (!reservations) {
      return false
    }

    const startOfDayToCheck = startOfDay(dayToCheck)
    const endOfDayToCheck = endOfDay(dayToCheck)

    for (let reservation of reservations) {
      console.log({ startOfDayToCheck })
      console.log({ reservation })
      console.log(new Date(reservation.StartDate))

      const startDateExistingReservation = new Date(reservation.StartDate)
      const endDateExistingReservation = new Date(reservation.EndDate)
      const reservationNotPossible =
        isWithinInterval(startOfDayToCheck, {
          start: startDateExistingReservation,
          end: endDateExistingReservation,
        }) ||
        isWithinInterval(endOfDayToCheck, {
          start: startDateExistingReservation,
          end: endDateExistingReservation,
        })
      if (reservationNotPossible) {
        return true
      }
    }

    return false
  }

  function revokeReservation() {}

  function reserveWorkplace(
    workplaceId: string,
    userId: string,
    startReservation: Date,
    endReservation: Date
  ) {
    const data = {
      workplaceId: workplaceId,
      userId: userId,
      startReservation: startReservation.toISOString(),
      endReservation: endReservation.toISOString(),
    }
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }

    axios
      .post(BASE_URL + 'workplace/reserve', data, requestConfig)
      .then(() => {
        toast.success('Reservation was successful!')
        updateWorkplaces()
      })
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  return (
    <div>
      <Button onClick={updateWorkplaces}>LoadWorkplaces</Button>
      <Button onClick={logWorkplaces}>Show Workplaces</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Weekday</TableCell>
            {workplaces.map((workplace) => (
              <TableCell key={`workplace-${workplace.id}`}>
                {workplace.name.String}
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
                {workplaces.map((workplace) => {
                  const reservedBy = isWorkplaceReserved(
                    currentDay,
                    workplace.reservations
                  )
                  const startOfCurrentDay = startOfDay(currentDay)
                  const endOfCurrentDay = endOfDay(currentDay)

                  return (
                    <TableCell key={`reservation-${day}-${workplace.id}`}>
                      <Button
                        variant={reservedBy ? 'outlined' : 'contained'}
                        disabled={reservedBy}
                        color={reservedBy ? 'error' : 'success'}
                        onClick={() =>
                          reserveWorkplace(
                            workplace.id,
                            loggedInUser.id,
                            startOfCurrentDay,
                            endOfCurrentDay
                          )
                        }
                      >
                        {reservedBy ? 'Taken' : 'Available'}
                      </Button>
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
