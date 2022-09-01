import { useState } from 'react'
import { Box, TextField, TextFieldProps } from '@material-ui/core'
import { useAuth } from '../utils/AuthProvider'
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import { DAYS_PER_WEEK, WEEK_STARTS_ON_MONDAY } from './WorkplaceAccordions'
import * as React from 'react'
import { DateRange, DateRangePicker } from 'mui-daterange-picker'
import { ACCORDION_LABEL_DATE_FORMAT } from './Workplaces'
import AddIcon from '@mui/icons-material/Add'

enum RepetitionInterval {
  weekly = DAYS_PER_WEEK,
  everySecondWeek = DAYS_PER_WEEK * 2,
  everyThirdWeek = DAYS_PER_WEEK * 3,
  monthly = DAYS_PER_WEEK * 4,
}

export const ReoccurringReservations = () => {
  // @ts-ignore
  const { jwtToken, user, setUser } = useAuth()
  const [noChangesMade, setNoChangesMade] = useState(true)
  const [details, setDetails] = useState({
    id: user.id,
    email: user.email,
    username: user.username.String,
    firstName: user.firstName.String,
    lastName: user.lastName.String,
  })
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({})
  const toggleDateSelection = () => setOpen(!open)
  const today = useState(new Date())

  // @ts-ignore
  const startOfTheWeek = startOfWeek(today, WEEK_STARTS_ON_MONDAY)
  // @ts-ignore
  const endOfTheWeek = endOfWeek(today, WEEK_STARTS_ON_MONDAY)

  const [dayOfTheWeek, setDayOfTheWeek] = useState('monday')
  const [repetitionInterval, setRepetitionInterval] = useState(
    RepetitionInterval.weekly
  )
  const [startOfReoccurringReservation, setStartOfReoccurringReservation] =
    useState(new Date())
  const [endOfReoccurringReservation, setEndOfReoccurringReservation] =
    useState(undefined)

  const [selectedDateAsString, setSelectedDateAsString] = useState('')

  const handleWeekdaySelection = (event: SelectChangeEvent) => {
    // @ts-ignore
    setDayOfTheWeek(event.target.value as string)
  }

  const handleRepetitionSelection = (event: SelectChangeEvent) => {
    // @ts-ignore
    setRepetitionInterval(event.target.value as string)
  }

  const convertDateRangeToString = (dateRange: DateRange) => {
    const startDateAsString = dateRange.startDate
      ? format(dateRange.startDate, ACCORDION_LABEL_DATE_FORMAT)
      : ''
    const endDateAsString = dateRange.endDate
      ? format(dateRange.endDate, ACCORDION_LABEL_DATE_FORMAT)
      : ''
    return `${startDateAsString} - ${endDateAsString}`
  }

  return (
    <Box>
      <Typography variant={'h4'} sx={{ mt: 2, mb: 2 }}>
        Reoccurring Reservations
      </Typography>
      {/*<Box sx={{ display: 'flex', justifyContent: 'center' }}>*/}
      <Box>
        <FormControl>
          <InputLabel id="weekday-selection-label">Weekday</InputLabel>
          <Select
            labelId="weekday-selection-label"
            value={dayOfTheWeek}
            onChange={handleWeekdaySelection}
            required
            sx={{ m: 2, minWidth: '6rem' }}
          >
            <MenuItem value={'monday'}>Monday</MenuItem>
            <MenuItem value={'tuesday'}>Tuesday</MenuItem>
            <MenuItem value={'wednesday'}>Wednesday</MenuItem>
            <MenuItem value={'friday'}>Friday</MenuItem>
            <MenuItem value={'saturday'}>Saturday</MenuItem>
            <MenuItem value={'sunday'}>Sunday</MenuItem>
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

        <IconButton type={'submit'}>
          <AddIcon></AddIcon>
          <Typography>Add reservation</Typography>
        </IconButton>

        <DateRangePicker
          open={open}
          toggle={toggleDateSelection}
          onChange={(dateRange: DateRange) => {
            setDateRange(dateRange)
            setSelectedDateAsString(convertDateRangeToString(dateRange))
          }}
          minDate={today as unknown as Date}
        />
      </Box>
    </Box>
  )
}
