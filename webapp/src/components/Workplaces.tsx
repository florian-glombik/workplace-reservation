import { Table, TableBody, TableHead, TableRow } from '@material-ui/core'
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
import { Button, TableCell, Typography } from '@mui/material'

export type NullString = {
  String: string
  Valid: boolean
}

export type Workplaces = {
  id: string
  name: NullString
  description: NullString
  reservations: Reservation[] | null
}

export type Reservation = {
  ID: string
  StartDate: string
  EndDate: string
  ReservedWorkplaceID: string
  ReservingUserID: string
  Username: NullString
  Email: NullString
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

  const [workplaces, setWorkplaces] = useState<Workplaces[]>([])

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
      .then((data) => {
        setWorkplaces(data)
      })
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  const logWorkplaces = () => {
    console.log({ workplaces })
  }

  /** */
  function getConflictingReservingUserIfExists(
    dayToCheck: Date,
    reservations: Reservation[] | null
  ): Reservation | null {
    if (!reservations) {
      return null
    }

    const startOfDayToCheck = startOfDay(dayToCheck)
    const endOfDayToCheck = endOfDay(dayToCheck)

    for (let reservation of reservations) {
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
        return reservation
      }
    }

    return null
  }

  function cancelReservation(reservationId: string) {
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }

    axios
      .delete(
        BASE_URL + 'workplace/reservations/' + reservationId,
        requestConfig
      )
      .then(() => {
        updateWorkplaces()
      })
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  function getReservingUsername(reservation: Reservation): string {
    if (reservation.Username.String) {
      return reservation.Username.String
    }
    return reservation.Email.String
  }

  function getButtonLabel(
    isReserved: boolean,
    isReservedByCurrentUser: boolean,
    reservation: Reservation | null
  ): string {
    if (!isReserved) {
      return 'Reserve'
    }

    if (isReservedByCurrentUser) {
      return 'Cancel'
    }

    return getReservingUsername(reservation!)
  }

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
                  const reservation: Reservation | null =
                    getConflictingReservingUserIfExists(
                      currentDay,
                      workplace.reservations
                    )
                  const startOfCurrentDay = startOfDay(currentDay)
                  const endOfCurrentDay = endOfDay(currentDay)

                  const isReserved = reservation != null
                  const isReservedByCurrentUser =
                    reservation?.ReservingUserID === loggedInUser.id

                  return (
                    <TableCell key={`reservation-${day}-${workplace.id}`}>
                      <Button
                        variant={isReserved ? 'outlined' : 'contained'}
                        disabled={isReserved && !isReservedByCurrentUser}
                        color={isReserved ? 'error' : 'success'}
                        onClick={
                          isReservedByCurrentUser
                            ? () => cancelReservation(reservation!.ID)
                            : () =>
                                reserveWorkplace(
                                  workplace.id,
                                  loggedInUser.id,
                                  startOfCurrentDay,
                                  endOfCurrentDay
                                )
                        }
                      >
                        <Typography noWrap>
                          {getButtonLabel(
                            isReserved,
                            isReservedByCurrentUser,
                            reservation
                          )}
                        </Typography>
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
