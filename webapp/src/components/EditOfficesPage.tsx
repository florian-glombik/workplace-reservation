import { Box, Button, Stack, TextField, Typography } from '@mui/material'

export function EditOfficesPage() {
  return (
    <Box sx={{ m: 2 }}>
      <Typography variant={'h4'} sx={{ mb: 4 }}>
        Edit Offices
      </Typography>
      <EditOffice />
    </Box>
  )
}

function EditOffice() {
  return (
    <Stack spacing={3}>
      <TextField label={'Name'} autoFocus />
      <TextField label={'Description'} />
      <TextField label={'Location'} />
      <TextField label={'LocationURL'} />
      <Button
        type={'submit'}
        variant={'contained'}
        sx={{ width: 'max-content' }}
      >
        Add Office
      </Button>
    </Stack>
  )
}
