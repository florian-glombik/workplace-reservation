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
import { Account, useAuth } from '../../utils/AuthProvider'
import { SERVER_BASE_URL } from '../../config'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  convertDateRangeToString,
  getWorkplaceName,
  RepetitionInterval,
  Weekday,
} from './ReoccuringReservationsForm'
import { getDay, parseISO } from 'date-fns'
import { NullString } from '../Workplace'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { TableHead, TableRow } from '@material-ui/core'
import { getUserDisplayName } from '../Header'

type ActiveRecurringReservation = {
  ID: string
  IntervalInDays: number
  RepeatedReservationID: string
  RepeatUntil: string
  StartDate: string
  ReservedWorkplaceID: string
  WorkplaceName: NullString
  ReservingUserID?: string
}

export const ActiveRecurringReservations = () => {
  const { jwtToken, user, isAdmin, availableUsers } = useAuth()
  const [activeRecurringReservations, setActiveRecurringReservations] =
    useState<ActiveRecurringReservation[]>([])

  useEffect(() => {
    updateActiveRecurringReservations()
  }, [])

  const updateActiveRecurringReservations = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      let requestUrl = SERVER_BASE_URL
      if (isAdmin) {
        requestUrl += 'reservations/recurring/all-users'
      } else {
        requestUrl += 'reservations/recurring'
      }

      const recurringReservations = (await axios.get(requestUrl, requestConfig))
        .data

      setActiveRecurringReservations(recurringReservations)
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  const deleteRecurringReservation = async (recurringReservationId: string) => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      await axios.delete(
        SERVER_BASE_URL + 'reservations/recurring/' + recurringReservationId,
        requestConfig
      )
      toast.success('Reoccurring reservation was deleted!')
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Box>
      {activeRecurringReservations && (
        <Table>
          <TableHead>
            <TableRow>
              {isAdmin && <TableCell>User</TableCell>}
              <TableCell>Workplace</TableCell>
              <TableCell>Weekday</TableCell>
              <TableCell>Repetition interval</TableCell>
              <TableCell>Timespan</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeRecurringReservations.map(
              (recurringReservation: ActiveRecurringReservation) => (
                <TableRow key={recurringReservation.ID}>
                  {isAdmin && (
                    <TableCell>
                      {getUserDisplayName(
                        availableUsers.find(
                          (user: Account) =>
                            user.id === recurringReservation.ReservingUserID
                        )
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {getWorkplaceName({
                      ID: recurringReservation.ReservedWorkplaceID,
                      Name: recurringReservation.WorkplaceName,
                      OfficeID: '',
                      Description: { String: '', Valid: false },
                    })}
                  </TableCell>
                  <TableCell>
                    {Weekday[getDay(parseISO(recurringReservation.StartDate))]}
                  </TableCell>
                  <TableCell>
                    {RepetitionInterval[recurringReservation.IntervalInDays]}
                  </TableCell>
                  <TableCell>
                    {convertDateRangeToString({
                      startDate: parseISO(recurringReservation.StartDate),
                      endDate: parseISO(recurringReservation.RepeatUntil),
                    })}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() =>
                        deleteRecurringReservation(recurringReservation.ID)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
      {!activeRecurringReservations && (
        <Typography sx={{ m: 2 }}>
          No active reoccurring reservations
        </Typography>
      )}
    </Box>
  )
}
