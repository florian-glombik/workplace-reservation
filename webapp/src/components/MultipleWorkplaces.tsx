import {
  addDays,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
} from 'date-fns'
import { Box } from '@mui/material'
import { ACCORDION_LABEL_DATE_FORMAT, Workplaces } from './Workplaces'
import {
  DAYS_PER_WEEK,
  MONDAY_NUMBER_CODE,
  WEEK_STARTS_ON_MONDAY,
} from './WorkplaceAccordions'
import { Account } from '../utils/AuthProvider'

type MultipleWorkplacesProps = {
  startDate: Date
  endDate: Date
  availableUsers: Account[]
}

export const MultipleWorkplaces = ({
  startDate,
  endDate,
  availableUsers,
}: MultipleWorkplacesProps) => {
  const workplaceInputs: MultipleWorkplacesProps[] = getWeekStartAndEndDates(
    startDate,
    endDate,
    availableUsers
  )

  return (
    <Box>
      {workplaceInputs.map((workplaceInput) => (
        <Workplaces
          key={`${format(
            workplaceInput.startDate,
            ACCORDION_LABEL_DATE_FORMAT
          )}-${format(workplaceInput.endDate, ACCORDION_LABEL_DATE_FORMAT)}`}
          startOfTheWeek={workplaceInput.startDate}
          endOfTheWeek={workplaceInput.endDate}
          defaultExpanded={false}
          availableUsers={availableUsers}
        />
      ))}
    </Box>
  )
}

function getWeekStartAndEndDates(
  startDate: Date,
  endDate: Date,
  availableUsers: Account[]
): MultipleWorkplacesProps[] {
  let workplacesInputs: MultipleWorkplacesProps[] = []

  let reachedEndDate: boolean = false
  if (!isBefore(startDate, endDate)) {
    console.error('Cannot calculate workplaces, endDate is before startDate', {
      startDate,
      endDate,
    })
    reachedEndDate = true
  }
  if (getDay(startDate) != MONDAY_NUMBER_CODE) {
    console.error(
      'Expected first day to be a monday, but is',
      getDay(startDate)
    )
  }

  let currentStartDate = startOfDay(startDate)
  // @ts-ignore
  let currentEndDate = endOfWeek(currentStartDate, WEEK_STARTS_ON_MONDAY)
  while (!reachedEndDate) {
    workplacesInputs.push({
      startDate: currentStartDate,
      endDate: currentEndDate,
      availableUsers: availableUsers,
    })

    if (isAfter(currentEndDate, endDate) || isEqual(currentEndDate, endDate)) {
      reachedEndDate = true
    }

    currentStartDate = addDays(currentStartDate, DAYS_PER_WEEK)
    currentEndDate = addDays(currentEndDate, DAYS_PER_WEEK)
  }

  return workplacesInputs
}
