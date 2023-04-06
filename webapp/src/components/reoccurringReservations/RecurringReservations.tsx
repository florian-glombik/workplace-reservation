import * as React from 'react'
import { Box } from '@material-ui/core'
import { Typography } from '@mui/material'
import { RecurringReservationsForm } from './ReoccuringReservationsForm'
import { ActiveRecurringReservations } from './ActiveRecurringReservations'

export const RecurringReservations = () => {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mt: 2, mb: 4 }}>
        Recurring Reservations
      </Typography>
      <RecurringReservationsForm></RecurringReservationsForm>
      <ActiveRecurringReservations></ActiveRecurringReservations>
    </Box>
  )
}
