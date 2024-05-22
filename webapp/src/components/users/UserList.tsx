import { Account, useAuth } from '../../utils/AuthProvider'
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { TableHead, TableRow } from '@material-ui/core'
import { composeServerUrl } from '../../utils/accessServer'
import LoginIcon from '@mui/icons-material/Login'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import BlockIcon from '@mui/icons-material/Block'

export function UserList() {
  const { jwtToken, user: loggedInUser } = useAuth()
  const [availableUsers, setAvailableUsers] = useState<Account[]>([])

  const loadUsers = async () => {
    const requestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const availableUsersResponse = await axios.get(
        composeServerUrl('users/all-available'),
        requestConfig
      )
      setAvailableUsers(availableUsersResponse.data)
    } catch (error) {
      toast.error('Could not load users: ' + getDisplayResponseMessage(error))
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAccessRightChange = async (
    userToBeUpdated: Account,
    newAccessGrantedValue: boolean
  ) => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    userToBeUpdated.accessGranted = newAccessGrantedValue

    try {
      const updatedUser = (
        await axios.patch(
          composeServerUrl('users/edit'),
          {
            id: userToBeUpdated.id,
            email: userToBeUpdated.email,
            username: userToBeUpdated.username.String,
            role: userToBeUpdated.role,
            accessGranted: newAccessGrantedValue,
          },
          requestConfig
        )
      ).data

      setAvailableUsers(
        availableUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      )
    } catch (error) {
      toast.error(getDisplayResponseMessage(error))
    }
  }

  const noUsersLoaded = availableUsers.length == 0
  return (
    <Box>
      {!noUsersLoaded && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>E-Mail</TableCell>
              <TableCell>User Role</TableCell>
              <TableCell>Access granted</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableUsers.map((user: Account) => {
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.username.String}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.accessGranted ? <CheckIcon /> : <CloseIcon />}
                  </TableCell>
                  <TableCell>
                    {user.id !== loggedInUser.id && (
                      <>
                        {user.accessGranted ? (
                          <Tooltip title={'Revoke access'}>
                            <IconButton
                              color={'primary'}
                              onClick={() =>
                                handleAccessRightChange(user, false)
                              }
                              aria-label="revoke access"
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={'Grant access'}>
                            <IconButton
                              color={'primary'}
                              onClick={() =>
                                handleAccessRightChange(user, true)
                              }
                              aria-label="grant access"
                            >
                              <LoginIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      {noUsersLoaded && (
        <Typography>No additional users registered yet</Typography>
      )}
    </Box>
  )
}
