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
import { WEEK_STARTS_ON_MONDAY } from './WorkplaceAccordions'
import * as React from 'react'
import { DateRange, DateRangePicker } from 'mui-daterange-picker'
import { ACCORDION_LABEL_DATE_FORMAT } from './Workplaces'
import AddIcon from '@mui/icons-material/Add'

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

  const [dayOfTheWeek, setDayOfTheWeek] = useState(undefined)
  const [startOfReoccurringReservation, setStartOfReoccurringReservation] =
    useState(new Date())
  const [endOfReoccurringReservation, setEndOfReoccurringReservation] =
    useState(null)

  const [selectedDateAsString, setSelectedDateAsString] = useState('')

  const handleChange = (event: SelectChangeEvent) => {
    // @ts-ignore
    setDayOfTheWeek(event.target.value as string)
  }

  const handleStartDateChange = (date: any) => {
    setStartOfReoccurringReservation(date)
  }

  const handleEndDateChange = (date: any) => {
    setEndOfReoccurringReservation(date)
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
      <Typography variant={'h4'} sx={{ mt: 2 }}>
        Reoccurring Reservations
      </Typography>
      {/*<Box sx={{ display: 'flex', justifyContent: 'center' }}>*/}
      <Box>
        <FormControl variant={'standard'} sx={{ display: 'flex' }}>
          <Grid>
            <InputLabel id="weekday-selection-label" sx={{ ml: 2 }}>
              Weekday
            </InputLabel>
            <Select
              labelId="weekday-selection-label"
              value={dayOfTheWeek}
              onChange={handleChange}
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
            <Select></Select>

            {/*TODO fix requirements*/}
            {/*TODO next week etc instead of last*/}
            <TextField
              label={'Timespan'}
              onClick={toggleDateSelection}
              required
              value={selectedDateAsString}
            />
            <IconButton type={'submit'}>
              <AddIcon></AddIcon>
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
          </Grid>
        </FormControl>
      </Box>
    </Box>
  )
}
