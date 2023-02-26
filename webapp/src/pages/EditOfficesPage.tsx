import { Box, Typography } from '@mui/material'
import { EditOffice } from '../components/offices/EditOffice'
import { OfficeList } from '../components/offices/OfficeList'

export function EditOfficesPage() {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        Edit Offices
      </Typography>
      <OfficeList />
      <EditOffice />
    </Box>
  )
}
