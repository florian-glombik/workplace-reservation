import * as React from 'react'
import { Box } from '@material-ui/core'
import { Typography } from '@mui/material'
import { RecurringReservationsForm } from './ReoccuringReservationsForm'
import { ActiveRecurringReservations } from './ActiveRecurringReservations'

export const RecurringReservations = () => {
  return (
    <Box>
      <Typography variant={'h4'} sx={{ mt: 2, mb: 2 }}>
        Recurring Reservations
      </Typography>
      <RecurringReservationsForm></RecurringReservationsForm>
      <ActiveRecurringReservations></ActiveRecurringReservations>
    </Box>
  )
}
