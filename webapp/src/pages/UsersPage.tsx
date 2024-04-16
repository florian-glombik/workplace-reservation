import { Box, Typography } from '@mui/material'
import { USER_MANAGEMENT_MENU_ENTRY } from '../components/Header'
import { UserList } from '../components/users/UserList'

export function UsersPage() {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        {USER_MANAGEMENT_MENU_ENTRY}
      </Typography>

      <UserList />
    </Box>
  )
}
