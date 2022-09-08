import * as React from 'react'
import { Box } from '@material-ui/core'
import { Typography } from '@mui/material'
import { ReoccurringReservationsForm } from './ReoccuringReservationsForm'
import { ActiveReoccurringReservations } from './ActiveReoccurringReservations'

export const ReoccurringReservations = () => {
  return (
    <Box>
      <Typography variant={'h4'} sx={{ mt: 2, mb: 2 }}>
        Reoccurring Reservations
      </Typography>
      <ReoccurringReservationsForm></ReoccurringReservationsForm>
      <ActiveReoccurringReservations></ActiveReoccurringReservations>
    </Box>
  )
}
