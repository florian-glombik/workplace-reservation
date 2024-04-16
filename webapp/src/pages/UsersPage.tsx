import { Box, Divider, Stack, Typography } from '@mui/material'
import { CreateOrEditOffice } from '../components/offices/CreateOrEditOffice'
import { OfficeList } from '../components/offices/OfficeList'
import { USER_MANAGEMENT_MENU_ENRTY } from '../components/Header'

export function UsersPage() {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        {USER_MANAGEMENT_MENU_ENRTY}
      </Typography>

      <Stack spacing={6}>
        <CreateOrEditOffice />
        <Divider />
        <OfficeList />
      </Stack>
    </Box>
  )
}
