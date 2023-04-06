import { Table, TableBody, TableHead, TableRow } from '@material-ui/core'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import { Account, isAdmin, useAuth } from '../utils/AuthProvider'
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
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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

export type Workplace = {
  id: string
  name: NullString
  description: NullString
  reservations: Reservation[] | null
}

export type WorkplaceWithoutReservations = {
  ID: string
  OfficeID: string
  Name: NullString
  Description: NullString
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
  const [workplaces, setWorkplaces] = useState<Workplace[]>([])
  const { jwtToken } = useAuth()

  useEffect(() => {
    updateWorkplaces()
  }, [])

  const updateWorkplaces = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
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

  const noWorkplacesFound = workplaces.length < 1

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
        {noWorkplacesFound && <Typography>No workplaces found</Typography>}
        {!noWorkplacesFound && (
          <WorkplaceReservationTable
            workplaces={workplaces}
            startOfTheWeek={startOfTheWeek}
            availableUsers={availableUsers}
            updateWorkplaces={updateWorkplaces}
          />
        )}
      </AccordionDetails>
    </Accordion>
  )
}

function WorkplaceReservationTable(props: {
  workplaces: Workplace[]
  startOfTheWeek: Date
  availableUsers: Account[]
  updateWorkplaces: () => void
}) {
  const { workplaces, startOfTheWeek, availableUsers, updateWorkplaces } = props
  const { jwtToken, user: loggedInUser } = useAuth()
  const loggedInUserIsAdmin = isAdmin(loggedInUser)

  return (
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

                const displayAdminSelection = loggedInUserIsAdmin && !isReserved

                const displayNoUserIcon = !isReserved && isDayInThePast

                return (
                  <TableCell key={`reservation-${day}-${workplace.id}`}>
                    {displayAdminSelection && (
                      <FormControl fullWidth>
                        <InputLabel id="reserving-user-selection-label">
                          Reserving user
                        </InputLabel>
                        <Select
                          labelId="reserving-user-selection-label"
                          id="reserving-user-selection"
                          value={''}
                          onChange={(e) => {
                            const selectedUser = availableUsers.find(
                              (user) => user.id === e.target.value
                            )

                            if (!selectedUser) {
                              toast('Error on reserving user selection')
                              return
                            }

                            reserveWorkplace(
                              workplace.id,
                              selectedUser.id,
                              startOfCurrentDay,
                              endOfCurrentDay,
                              jwtToken,
                              updateWorkplaces
                            )
                          }}
                        >
                          {availableUsers.map((user: Account) => (
                            <MenuItem
                              value={user.id}
                              key={`reserving-user-selection-${day}-${workplace.id}-${user.id}`}
                              sx={{
                                fontWeight:
                                  user.id === loggedInUser.id ? 'bold' : '',
                              }}
                            >
                              {user.username.String
                                ? user.username.String
                                : user.email}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {!displayAdminSelection && displayNoUserIcon && (
                      <NoAccountsIcon sx={{ opacity: 0.3 }}></NoAccountsIcon>
                    )}
                    {!displayAdminSelection && !displayNoUserIcon && (
                      <Button
                        variant={
                          isReserved || displayNoUserIcon
                            ? 'outlined'
                            : 'contained'
                        }
                        disabled={
                          (isDayInThePast && !loggedInUserIsAdmin) ||
                          (isReserved &&
                            !isReservedByCurrentUser &&
                            !loggedInUserIsAdmin)
                        }
                        color={isReserved ? 'error' : 'success'}
                        onClick={
                          isReservedByCurrentUser ||
                          (isReserved && loggedInUserIsAdmin)
                            ? () =>
                                cancelReservation(
                                  reservation!,
                                  jwtToken,
                                  updateWorkplaces
                                )
                            : () =>
                                reserveWorkplace(
                                  workplace.id,
                                  loggedInUser.id,
                                  startOfCurrentDay,
                                  endOfCurrentDay,
                                  jwtToken,
                                  updateWorkplaces
                                )
                        }
                      >
                        <Typography noWrap>
                          {getButtonLabel(
                            isReserved,
                            isReservedByCurrentUser,
                            isDayInThePast,
                            reservation
                          )}
                        </Typography>
                      </Button>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

async function reserveWorkplace(
  workplaceId: string,
  userId: string,
  startReservation: Date,
  endReservation: Date,
  jwtToken: string,
  updateWorkplaces: () => void
) {
  const data = {
    workplaceId: workplaceId,
    userId: userId,
    startReservation: startReservation.toISOString(),
    endReservation: endReservation.toISOString(),
  }
  const requestConfig = {
    headers: {
      Authorization: 'Bearer ' + jwtToken,
    },
  }

  try {
    await axios.post(BASE_URL + 'workplace/reserve', data, requestConfig)
    updateWorkplaces()
  } catch (error) {
    toast.error(getDisplayResponseMessage(error))
  }
}

async function cancelReservation(
  reservation: Reservation,
  jwtToken: string,
  updateWorkplaces: () => void
) {
  const requestConfig = {
    headers: {
      Authorization: 'Bearer ' + jwtToken,
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

function getReservingUsername(reservation: Reservation): string {
  if (reservation.Username.String) {
    return reservation.Username.String
  }
  return reservation.Email.String
}
