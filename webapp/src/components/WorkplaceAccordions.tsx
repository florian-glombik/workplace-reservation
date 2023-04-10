import { MultipleWorkplaces } from './MultipleWorkplaces'
import { addDays, endOfWeek, nextMonday, startOfWeek } from 'date-fns'
import { Workplace, Workplaces } from './Workplace'
import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { Account, useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../utils/NotificationUtil'
import {composeBackendUrl} from "../utils/accessBackend";

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
  const { user, jwtToken, isAdmin } = useAuth()

  const [today] = useState(Date.now())
  const startOfTheWeek = startOfWeek(today, WEEK_STARTS_ON_MONDAY)
  const endOfTheWeek = endOfWeek(today, WEEK_STARTS_ON_MONDAY)

  const [availableUsers, setAvailableUsers] = useState<Account[]>([])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [])

  const loadUsers = async () => {
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const availableUsersResponse = await axios.get(
        composeBackendUrl('users/all-available'),
        requestConfig
      )
      setAvailableUsers(availableUsersResponse.data)
    } catch (error) {
      toast.error('Could not load users: ' + getDisplayResponseMessage(error))
    }
  }

  return (
    <Box>
      <MultipleWorkplaces
        startDate={addDays(
          startOfTheWeek,
          -WEEKS_BEFORE_DEFAULT * DAYS_PER_WEEK
        )}
        endDate={addDays(endOfTheWeek, -DAYS_PER_WEEK)}
        availableUsers={availableUsers}
      ></MultipleWorkplaces>
      <Workplaces
        startOfTheWeek={startOfTheWeek}
        endOfTheWeek={endOfTheWeek}
        defaultExpanded={true}
        availableUsers={availableUsers}
      />
      <MultipleWorkplaces
        startDate={nextMonday(startOfTheWeek)}
        endDate={addDays(endOfTheWeek, WEEKS_AFTER_DEFAULT * DAYS_PER_WEEK)}
        availableUsers={availableUsers}
      ></MultipleWorkplaces>
    </Box>
  )
}
