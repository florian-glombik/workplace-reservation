import { Box, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { useAuth } from '../../utils/AuthProvider'
import { BASE_URL } from '../../config'
import DeleteIcon from '@mui/icons-material/Delete'
import { convertDateRangeToString, getWorkplaceName, RepetitionInterval, Weekday } from './ReoccuringReservationsForm'
import { getDay, parseISO } from 'date-fns'
import { NullString } from '../Workplaces'

type ActiveReoccurringReservation = {
  ID: string
  IntervalInDays: number
  RepeatedReservationID: string
  RepeatUntil: string
  StartDate: string
  ReservedWorkplaceID: string
  Workplacename: NullString
}

export const ActiveReoccurringReservations = () => {
  // @ts-ignore
  const { jwtToken } = useAuth()
  const [activeReoccurringReservations, setActiveReoccurringReservations] = useState<ActiveReoccurringReservation[]>([])

  useEffect(() => {
    updateActiveReoccurringReservations()
  }, [])

  const updateActiveReoccurringReservations = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    axios.get(BASE_URL + 'reservations/reoccurring', requestConfig).then((response) => response.data).then((data) => {
      setActiveReoccurringReservations(data)
    })
  }

  return (
    <Box>
      {activeReoccurringReservations.map((reoccurringReservation: ActiveReoccurringReservation) => (
        <Box sx={{ display: 'flex' }} key={reoccurringReservation.ID}>
          <Typography sx={{ m: 2 }}>Workplace: {getWorkplaceName({ID: reoccurringReservation.ReservedWorkplaceID, Name: reoccurringReservation.Workplacename})}</Typography>
          <Typography sx={{ m: 2 }}>Weekday: {Weekday[getDay(parseISO(reoccurringReservation.StartDate))]}</Typography>
          <Typography sx={{ m: 2 }}>Repetition
            Interval: {RepetitionInterval[reoccurringReservation.IntervalInDays]}</Typography>
          <Typography sx={{ m: 2 }}>Timespan: {convertDateRangeToString({
            startDate: parseISO(reoccurringReservation.StartDate),
            endDate: parseISO(reoccurringReservation.RepeatUntil),
          })}</Typography>
          <IconButton><DeleteIcon /></IconButton>
        </Box>
      ))}
    </Box>

  )
}