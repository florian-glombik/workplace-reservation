import { Box, TextField } from '@material-ui/core'
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { DateRange, DateRangePicker } from 'mui-daterange-picker'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { ACCORDION_LABEL_DATE_FORMAT, WorkplaceWithName } from '../Workplaces'
import { DAYS_PER_WEEK } from '../WorkplaceAccordions'
import axios, { AxiosRequestConfig } from 'axios'
import { format } from 'date-fns-tz'
import {
  endOfDay,
  nextFriday,
  nextMonday,
  nextSaturday,
  nextSunday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  startOfDay,
} from 'date-fns'
import { BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { useAuth } from '../../utils/AuthProvider'

export enum RepetitionInterval {
  weekly = DAYS_PER_WEEK,
  everySecondWeek = DAYS_PER_WEEK * 2,
  everyThirdWeek = DAYS_PER_WEEK * 3,
  monthly = DAYS_PER_WEEK * 4,
}

export enum Weekday {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

type RecurringReservationRequest = {
  workplaceId: string
  intervalInDays: number
  reservationStartDay: string
  repeatUntil: string
}

export const convertDateRangeToString = (dateRange: DateRange) => {
  const startDateAsString = dateRange.startDate
    ? format(dateRange.startDate, ACCORDION_LABEL_DATE_FORMAT)
    : ''
  const endDateAsString = dateRange.endDate
    ? format(dateRange.endDate, ACCORDION_LABEL_DATE_FORMAT)
    : ''
  return `${startDateAsString} - ${endDateAsString}`
}

const nextWeekday = (weekday: Weekday, startDate: Date): Date => {
  // TODO fix types
  switch (Weekday[weekday]) {
    // @ts-ignore
    case Weekday.Monday:
      return nextMonday(startDate)
    // @ts-ignore
    case Weekday.Tuesday:
      return nextTuesday(startDate)
    // @ts-ignore
    case Weekday.Wednesday:
      return nextWednesday(startDate)
    // @ts-ignore
    case Weekday.Thursday:
      return nextThursday(startDate)
    // @ts-ignore
    case Weekday.Friday:
      return nextFriday(startDate)
    // @ts-ignore
    case Weekday.Saturday:
      return nextSaturday(startDate)
    // @ts-ignore
    case Weekday.Sunday:
      return nextSunday(startDate)
  }
  console.error(`Unknown weekday ${weekday}`)
  return startDate
}

export function getWorkplaceName(workplace: WorkplaceWithName): string {
  return workplace?.Name?.String ? workplace.Name.String : workplace.ID
}

export const RecurringReservationsForm = () => {
  // @ts-ignore
  const { jwtToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [workplaces, setWorkplaces] = useState<WorkplaceWithName[]>([])
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState('')
  const [dayOfTheWeek, setDayOfTheWeek] = useState<Weekday>(
    // @ts-ignore
    Weekday[Weekday.Monday]
  )
  const [repetitionInterval, setRepetitionInterval] = useState(
    RepetitionInterval.weekly
  )
  const toggleDateSelection = () => setOpen(!open)
  const [selectedDateAsString, setSelectedDateAsString] = useState('')
  const [disableSubmitButton, setDisableSubmitButton] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({})

  useEffect(() => {
    updateWorkplaceNames()
  }, [])

  const updateWorkplaceNames = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }
    axios
      .get(BASE_URL + 'workplaces/names', requestConfig)
      .then((response) => response.data)
      .then((data) => {
        setWorkplaces(data)
        setDefaultWorkplace(data)
      })
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  const setDefaultWorkplace = (workplaces: WorkplaceWithName[]) => {
    if (workplaces.length > 0) {
      setSelectedWorkplaceId(workplaces[0].ID)
    }
  }

  const handleSelectedWorkplaceIdSelection = (event: SelectChangeEvent) => {
    setSelectedWorkplaceId(event.target.value)
  }

  const handleWeekdaySelection = (event: SelectChangeEvent) => {
    // @ts-ignore
    setDayOfTheWeek(Weekday[event.target.value])
  }

  const handleRepetitionSelection = (event: SelectChangeEvent) => {
    // @ts-ignore
    setRepetitionInterval(event.target.value as string)
  }

  const addRecurringReservation = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const DATE_FORMAT_STRING_RFC_3339 = "yyyy-MM-dd'T'HH:mm:ssXXX"

    const reservationStartDay = nextWeekday(dayOfTheWeek, dateRange.startDate!)

    const requestData: RecurringReservationRequest = {
      workplaceId: selectedWorkplaceId,
      intervalInDays: repetitionInterval,
      // @ts-ignore
      reservationStartDay: format(
        startOfDay(reservationStartDay),
        DATE_FORMAT_STRING_RFC_3339,
        { timeZone: timezone }
      ),
      repeatUntil: format(
        endOfDay(dateRange.endDate!),
        DATE_FORMAT_STRING_RFC_3339,
        { timeZone: timezone }
      ),
    }

    axios
      .post(BASE_URL + 'reservations/reoccurring', requestData, requestConfig)
      .then(() =>
        toast.success('Reoccurring reservation was successfully created!')
      )
      .catch((error) => toast.error(getDisplayResponseMessage(error)))

    // TODO update list of loaded reservations
  }

  const today = useState(new Date())

  const isSubmitButtonDisabled = (dateRange: DateRange) => {
    return !(!!dateRange.startDate && !!dateRange.endDate)
  }

  return (
    <Box>
      <FormControl>
        <InputLabel id="workplace-selection-label">Workplace</InputLabel>
        <Select
          labelId="workplace-selection-label"
          value={selectedWorkplaceId}
          onChange={handleSelectedWorkplaceIdSelection}
          required
          sx={{ m: 2, minWidth: '6rem' }}
        >
          {workplaces.map((workplace) => (
            <MenuItem value={workplace.ID} key={workplace.ID}>
              {getWorkplaceName(workplace)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel id="weekday-selection-label">Weekday</InputLabel>
        <Select
          labelId="weekday-selection-label"
          value={Weekday[dayOfTheWeek]}
          onChange={handleWeekdaySelection}
          required
          sx={{ m: 2, minWidth: '6rem' }}
        >
          <MenuItem value={Weekday.Monday}>Monday</MenuItem>
          <MenuItem value={Weekday.Tuesday}>Tuesday</MenuItem>
          <MenuItem value={Weekday.Wednesday}>Wednesday</MenuItem>
          <MenuItem value={Weekday.Thursday}>Thursday</MenuItem>
          <MenuItem value={Weekday.Friday}>Friday</MenuItem>
          <MenuItem value={Weekday.Saturday}>Saturday</MenuItem>
          <MenuItem value={Weekday.Sunday}>Sunday</MenuItem>
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel id="repeat-interval-section">
          Repetition interval
        </InputLabel>
        <Select
          labelId="repeat-interval-section"
          id={'repeat-interval-section'}
          // @ts-ignore
          value={repetitionInterval}
          onChange={handleRepetitionSelection}
          required
          sx={{ m: 2, minWidth: '10rem' }}
        >
          <MenuItem value={RepetitionInterval.weekly}>weekly</MenuItem>
          <MenuItem value={RepetitionInterval.everySecondWeek}>
            every second week
          </MenuItem>
          <MenuItem value={RepetitionInterval.everyThirdWeek}>
            every third week
          </MenuItem>
          <MenuItem value={RepetitionInterval.monthly}>every month</MenuItem>
        </Select>
      </FormControl>

      {/*TODO fix requirements */}
      {/*TODO next week etc instead of last */}
      {/*TODO remove highlight on weekday selection */}

      <FormControl>
        <TextField
          label={'Timespan'}
          onClick={toggleDateSelection}
          required
          value={selectedDateAsString}
        />
      </FormControl>

      <IconButton
        onClick={addRecurringReservation}
        disabled={disableSubmitButton}
        color={'primary'}
      >
        <AddIcon></AddIcon>
        <Typography>Add reservation</Typography>
      </IconButton>

      <DateRangePicker
        open={open}
        toggle={toggleDateSelection}
        onChange={(dateRange: DateRange) => {
          setDateRange(dateRange)
          setDisableSubmitButton(isSubmitButtonDisabled(dateRange))
          setSelectedDateAsString(convertDateRangeToString(dateRange))
        }}
        minDate={today as unknown as Date}
      />
    </Box>
  )
}
