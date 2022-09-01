import { useEffect, useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import { useAuth } from '../utils/AuthProvider'
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { DAYS_PER_WEEK } from './WorkplaceAccordions'
import * as React from 'react'
import { DateRange, DateRangePicker } from 'mui-daterange-picker'
import { ACCORDION_LABEL_DATE_FORMAT, WorkplaceWithName } from './Workplaces'
import AddIcon from '@mui/icons-material/Add'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'

enum RepetitionInterval {
  weekly = DAYS_PER_WEEK,
  everySecondWeek = DAYS_PER_WEEK * 2,
  everyThirdWeek = DAYS_PER_WEEK * 3,
  monthly = DAYS_PER_WEEK * 4,
}

type ReoccurringReservationRequest = {
  workplaceId: string
  intervalInDays: number
  reservationStartDay: Date
  repeatUntil: Date
}

export const ReoccurringReservations = () => {
  // @ts-ignore
  const { jwtToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [workplaces, setWorkplaces] = useState<WorkplaceWithName[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [disableSubmitButton, setDisableSubmitButton] = useState(true)
  const toggleDateSelection = () => setOpen(!open)
  const today = useState(new Date())
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState('')

  const [dayOfTheWeek, setDayOfTheWeek] = useState('monday')
  const [repetitionInterval, setRepetitionInterval] = useState(
    RepetitionInterval.weekly
  )
  const [selectedDateAsString, setSelectedDateAsString] = useState('')

  const handleWeekdaySelection = (event: SelectChangeEvent) => {
    setDayOfTheWeek(event.target.value as string)
  }

  const handleSelectedWorkplaceIdSelection = (event: SelectChangeEvent) => {
    setSelectedWorkplaceId(event.target.value)
  }

  const handleRepetitionSelection = (event: SelectChangeEvent) => {
    // @ts-ignore
    setRepetitionInterval(event.target.value as string)
  }

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
        console.log(data)
      })
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

  const addReoccurringReservation = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    const requestData: ReoccurringReservationRequest = {
      workplaceId: selectedWorkplaceId,
      intervalInDays: repetitionInterval,
      reservationStartDay: dateRange.startDate!,
      repeatUntil: dateRange.endDate!,
    }

    axios
      .post(BASE_URL + 'reservations/reoccurring', requestData, requestConfig)
      .then((response) => console.log(response))
      .catch((error) => toast.error(getDisplayResponseMessage(error)))
  }

  const isSubmitButtonDisabled = (dateRange: DateRange) => {
    return !(!!dateRange.startDate && !!dateRange.endDate)
  }

  return (
    <Box>
      <Typography variant={'h4'} sx={{ mt: 2, mb: 2 }}>
        Reoccurring Reservations
      </Typography>
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
                {workplace?.Name?.String ? workplace.Name.String : workplace.ID}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <IconButton
          onClick={addReoccurringReservation}
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
    </Box>
  )
}
