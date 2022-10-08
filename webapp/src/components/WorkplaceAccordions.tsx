import { MultipleWorkplaces } from './MultipleWorkplaces'
import { addDays, endOfWeek, nextMonday, startOfWeek } from 'date-fns'
import { Workplaces } from './Workplaces'
import React, { useState } from 'react'
import { Box } from '@mui/material'

export const MONDAY_NUMBER_CODE = 1
export const WEEK_STARTS_ON_MONDAY: {
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
} = {
  weekStartsOn: MONDAY_NUMBER_CODE,
}

const WEEKS_BEFORE_DEFAULT = 2
const WEEKS_AFTER_DEFAULT = 4
export const DAYS_PER_WEEK = 7

export const WorkplaceAccordions = () => {
  const [today] = useState(Date.now())
  const startOfTheWeek = startOfWeek(today, WEEK_STARTS_ON_MONDAY)
  const endOfTheWeek = endOfWeek(today, WEEK_STARTS_ON_MONDAY)

  return (
    <Box>
      <MultipleWorkplaces
        startDate={addDays(
          startOfTheWeek,
          -WEEKS_BEFORE_DEFAULT * DAYS_PER_WEEK
        )}
        endDate={addDays(endOfTheWeek, -DAYS_PER_WEEK)}
      ></MultipleWorkplaces>
      <Workplaces
        startOfTheWeek={startOfTheWeek}
        endOfTheWeek={endOfTheWeek}
        defaultExpanded={true}
      />
      <MultipleWorkplaces
        startDate={nextMonday(startOfTheWeek)}
        endDate={addDays(endOfTheWeek, WEEKS_AFTER_DEFAULT * DAYS_PER_WEEK)}
      ></MultipleWorkplaces>
    </Box>
  )
}
