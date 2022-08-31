import { useState } from 'react'
import { Box, TextField, TextFieldProps } from '@material-ui/core'
import { useAuth } from '../utils/AuthProvider'
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { endOfWeek, startOfWeek } from 'date-fns'
import { WEEK_STARTS_ON_MONDAY } from './WorkplaceAccordions'
import * as React from 'react'
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
// import {
//   DateRangePicker,
//   DateRange,
//   DateRangeDelimiter,
// } from '@material-ui/pickers'

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

  const today = useState(new Date())

  // @ts-ignore
  const startOfTheWeek = startOfWeek(today, WEEK_STARTS_ON_MONDAY)
  // @ts-ignore
  const endOfTheWeek = endOfWeek(today, WEEK_STARTS_ON_MONDAY)

  const [dayOfTheWeek, setDayOfTheWeek] = useState('monday')
  const [startOfReoccurringReservation, setStartOfReoccurringReservation] =
    useState(new Date())
  const [endOfReoccurringReservation, setEndOfReoccurringReservation] =
    useState(null)

  const handleChange = (event: SelectChangeEvent) => {
    setDayOfTheWeek(event.target.value as string)
  }

  const handleStartDateChange = (date: any) => {
    setStartOfReoccurringReservation(date)
  }

  const handleEndDateChange = (date: any) => {
    setEndOfReoccurringReservation(date)
  }

  // const [value, setValue] = React.useState<DateRange<Date>>([null, null])

  return (
    <Box>
      <Typography variant={'h4'} sx={{ mt: 2 }}>
        Reoccurring Reservations
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <FormControl variant={'standard'}>
          <InputLabel id="demo-simple-select-label">Weekday</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={dayOfTheWeek}
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value={'monday'}>Monday</MenuItem>
            <MenuItem value={'tuesday'}>Tuesday</MenuItem>
            <MenuItem value={'wednesday'}>Wednesday</MenuItem>
            <MenuItem value={'friday'}>Friday</MenuItem>
            <MenuItem value={'saturday'}>Saturday</MenuItem>
            <MenuItem value={'sunday'}>Sunday</MenuItem>
          </Select>
        </FormControl>
        {/*<DateRangePicker*/}
        {/*  startText="Check-in"*/}
        {/*  endText="Check-out"*/}
        {/*  value={value}*/}
        {/*  onChange={(newValue: any) => setValue(newValue)}*/}
        {/*  renderInput={(startProps: any, endProps: any) => (*/}
        {/*    <React.Fragment>*/}
        {/*      <TextField {...startProps} />*/}
        {/*      <DateRangeDelimiter> to </DateRangeDelimiter>*/}
        {/*      <TextField {...endProps} />*/}
        {/*    </React.Fragment>*/}
        {/*  )}*/}
        {/*/>*/}
        {/*<MuiPickersUtilsProvider utils={DateFnsUtils}>*/}
        {/*  <KeyboardDatePicker*/}
        {/*    disableToolbar*/}
        {/*    variant="inline"*/}
        {/*    format="dd/MM/yyyy"*/}
        {/*    margin="normal"*/}
        {/*    id="date-picker-inline"*/}
        {/*    label="Start"*/}
        {/*    value={startOfReoccurringReservation}*/}
        {/*    onChange={handleStartDateChange}*/}
        {/*    KeyboardButtonProps={{*/}
        {/*      'aria-label': 'change date',*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</MuiPickersUtilsProvider>*/}
        {/*<MuiPickersUtilsProvider utils={DateFnsUtils}>*/}
        {/*  <KeyboardDatePicker*/}
        {/*    disableToolbar*/}
        {/*    variant="inline"*/}
        {/*    format="dd/MM/yyyy"*/}
        {/*    margin="normal"*/}
        {/*    id="date-picker-inline"*/}
        {/*    label="End"*/}
        {/*    value={endOfReoccurringReservation}*/}
        {/*    onChange={handleEndDateChange}*/}
        {/*    KeyboardButtonProps={{*/}
        {/*      'aria-label': 'change date',*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</MuiPickersUtilsProvider>*/}
      </Box>
    </Box>
  )
}
