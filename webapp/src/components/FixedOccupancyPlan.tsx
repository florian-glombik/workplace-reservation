import './Login.css'
import { Box } from '@material-ui/core'
import { Typography } from '@mui/material'

type Assigment = {
  userId: string
  workplaceId: string
  weekday: string
}

type AssigmentRequest = {
  assignment: Assigment
  preference: 1 | 2 | 3 | 4 | 5 | undefined
}

type FixedOccupancyPlan = {
  id: string
  name: string
  enterPreferencesDueDate: Date
  startDate: Date
  endDate: Date
  requestedAssignment: AssigmentRequest[]
  assignments: Assigment[]
}

export const FixedOccupancyPlan = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Typography>TODO</Typography>
    </Box>
  )
}
