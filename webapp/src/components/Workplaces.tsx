import { Table, TableBody, TableHead, TableRow } from '@material-ui/core'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { Account, useAuth } from '../utils/AuthProvider'
import { useEffect, useState } from 'react'
import {
  addDays,
  endOfDay,
  format,
  isBefore,
  isThisWeek,
  isToday,
  isWeekend,
  isWithinInterval,
  startOfDay,
} from 'date-fns'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  TableCell,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import withStyles from '@material-ui/core/styles/withStyles'
import NoAccountsIcon from '@mui/icons-material/NoAccounts'
import { WEEK_STARTS_ON_MONDAY } from './WorkplaceAccordions'

const IconLeftAccordionSummary = withStyles({
  expandIcon: {
    order: -1,
  },
})(AccordionSummary)

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

export type WorkplaceWithName = {
  ID: string
  Name: NullString
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

export const ACCORDION_LABEL_DATE_FORMAT = 'dd-MM-yy'

type WorkplacesProps = {
  startOfTheWeek: Date
  endOfTheWeek: Date
  defaultExpanded: boolean
  availableUsers: Account[]
}

export const Workplaces = ({
  startOfTheWeek,
  endOfTheWeek,
  defaultExpanded,
  availableUsers,
}: WorkplacesProps) => {
  // @ts-ignore
  const token = useAuth().jwtToken
  // @ts-ignore
  const loggedInUser = useAuth().user

  // @ts-ignore
  const { isAdmin } = useAuth()

  const [workplaces, setWorkplaces] = useState<Workplaces[]>([])

  // @ts-ignore
  const [userToBeReserved, setUserToBeReserved] = useState(useAuth().user)

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

    try {
      const workplaces = await axios.get(BASE_URL + 'workplaces', requestConfig)
      setWorkplaces(workplaces.data)
    } catch (error) {
      toast.error(
        'Could not load workplaces: ' + getDisplayResponseMessage(error)
      )
    }
  }

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

  async function cancelReservation(reservation: Reservation) {
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      params: {
        start: reservation.StartDate,
        end: reservation.EndDate,
        reservingUserId: reservation.ReservingUserID,
        reservedWorkplaceId: reservation.ReservedWorkplaceID,
      },
    }

    try {
      await axios.delete(
        BASE_URL + 'workplace/reservations/' + reservation.ID,
        requestConfig
      )
      updateWorkplaces()
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
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
    isInThePast: boolean,
    reservation: Reservation | null
  ): string {
    if (!isReserved) {
      return 'Reserve'
    }

    if (isReservedByCurrentUser && !isInThePast) {
      return 'Cancel'
    }

    return getReservingUsername(reservation!)
  }

  async function reserveWorkplace(
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

    try {
      await axios.post(BASE_URL + 'workplace/reserve', data, requestConfig)
      updateWorkplaces()
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <IconLeftAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          sx={{
            fontWeight: isThisWeek(startOfTheWeek, WEEK_STARTS_ON_MONDAY)
              ? 'bold'
              : '',
          }}
        >
          {format(startOfTheWeek, ACCORDION_LABEL_DATE_FORMAT)} -{' '}
          {format(endOfTheWeek, ACCORDION_LABEL_DATE_FORMAT)}
        </Typography>
      </IconLeftAccordionSummary>
      <AccordionDetails>
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
              const dayIsToday = isToday(currentDay)
              const dayIsWeekend = isWeekend(currentDay)

              const weekendStyle = { opacity: 0.7 }

              return (
                <TableRow
                  key={`worplace-reservations-${day}`}
                  style={dayIsWeekend ? weekendStyle : {}}
                >
                  <TableCell sx={{ fontWeight: dayIsToday ? 'bold' : '' }}>
                    {currentDay.getDate()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: dayIsToday ? 'bold' : '' }}>
                    {day}
                  </TableCell>
                  {workplaces.map((workplace) => {
                    const reservation: Reservation | null =
                      getConflictingReservingUserIfExists(
                        currentDay,
                        workplace.reservations
                      )
                    const startOfCurrentDay = startOfDay(currentDay)
                    const endOfCurrentDay = endOfDay(currentDay)

                    const isDayInThePast: boolean = isBefore(
                      startOfCurrentDay,
                      startOfDay(Date.now())
                    )

                    const isReserved: boolean = reservation != null
                    const isReservedByCurrentUser =
                      reservation?.ReservingUserID === loggedInUser.id
                    const displayNoUserIcon = !isReserved && isDayInThePast

                    return (
                      <TableCell key={`reservation-${day}-${workplace.id}`}>
                        <Button
                          variant={
                            isReserved || displayNoUserIcon
                              ? 'outlined'
                              : 'contained'
                          }
                          disabled={
                            isDayInThePast ||
                            (isReserved && !isReservedByCurrentUser && !isAdmin)
                          }
                          color={isReserved ? 'error' : 'success'}
                          onClick={
                            isReservedByCurrentUser || (isReserved && isAdmin)
                              ? () => cancelReservation(reservation!)
                              : () =>
                                  reserveWorkplace(
                                    workplace.id,
                                    loggedInUser.id,
                                    startOfCurrentDay,
                                    endOfCurrentDay
                                  )
                          }
                        >
                          {displayNoUserIcon && (
                            <NoAccountsIcon></NoAccountsIcon>
                          )}
                          {!displayNoUserIcon && (
                            <Typography noWrap>
                              {getButtonLabel(
                                isReserved,
                                isReservedByCurrentUser,
                                isDayInThePast,
                                reservation
                              )}
                            </Typography>
                          )}
                        </Button>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  )
}
