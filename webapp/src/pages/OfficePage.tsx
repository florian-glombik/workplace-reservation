import { Box, Divider, Stack, Typography } from '@mui/material'
import { CreateOrEditOffice } from '../components/offices/CreateOrEditOffice'
import { OfficeList } from '../components/offices/OfficeList'
import { OFFICE_MENU_ENTRY } from '../components/Header'

export function OfficePage() {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        {OFFICE_MENU_ENTRY}
      </Typography>

      <Stack spacing={6}>
        <CreateOrEditOffice />
        <Divider />
        <OfficeList />
      </Stack>
    </Box>
  )
}
