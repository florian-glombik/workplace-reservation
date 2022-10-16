import { Box, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { useAuth } from '../../utils/AuthProvider'
import { BASE_URL } from '../../config'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  convertDateRangeToString,
  getWorkplaceName,
  RepetitionInterval,
  Weekday,
} from './ReoccuringReservationsForm'
import { getDay, parseISO } from 'date-fns'
import { NullString } from '../Workplaces'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'

type ActiveRecurringReservation = {
  ID: string
  IntervalInDays: number
  RepeatedReservationID: string
  RepeatUntil: string
  StartDate: string
  ReservedWorkplaceID: string
  Workplacename: NullString
}

export const ActiveRecurringReservations = () => {
  // @ts-ignore
  const { jwtToken } = useAuth()
  const [activeRecurringReservations, setActiveRecurringReservations] =
    useState<ActiveRecurringReservation[]>([])

  useEffect(() => {
    updateActiveReoccurringReservations()
  }, [])

  const updateActiveReoccurringReservations = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    axios
      .get(BASE_URL + 'reservations/reoccurring', requestConfig)
      .then((response) => response.data)
      .then((data) => {
        setActiveRecurringReservations(data)
      })
  }

  const deleteReoccurringReservation = async (
    reoccurringReservationId: string
  ) => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }
    axios
      .delete(
        BASE_URL + 'reservations/reoccurring/' + reoccurringReservationId,
        requestConfig
      )
      .then(() => toast.success('Reoccurring reservation was deleted!'))
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  // TODO use table instead
  return (
    <Box>
      {activeRecurringReservations &&
        activeRecurringReservations.map(
          (reoccurringReservation: ActiveRecurringReservation) => (
            <Box sx={{ display: 'flex' }} key={reoccurringReservation.ID}>
              <Typography sx={{ m: 2 }}>
                Workplace:{' '}
                {getWorkplaceName({
                  ID: reoccurringReservation.ReservedWorkplaceID,
                  Name: reoccurringReservation.Workplacename,
                })}
              </Typography>
              <Typography sx={{ m: 2 }}>
                Weekday:{' '}
                {Weekday[getDay(parseISO(reoccurringReservation.StartDate))]}
              </Typography>
              <Typography sx={{ m: 2 }}>
                Repetition Interval:{' '}
                {RepetitionInterval[reoccurringReservation.IntervalInDays]}
              </Typography>
              <Typography sx={{ m: 2 }}>
                Timespan:{' '}
                {convertDateRangeToString({
                  startDate: parseISO(reoccurringReservation.StartDate),
                  endDate: parseISO(reoccurringReservation.RepeatUntil),
                })}
              </Typography>
              <IconButton
                onClick={() =>
                  deleteReoccurringReservation(reoccurringReservation.ID)
                }
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )
        )}
      {!activeRecurringReservations && (
        <Typography sx={{ m: 2 }}>
          No active reoccurring reservations
        </Typography>
      )}
    </Box>
  )
}
