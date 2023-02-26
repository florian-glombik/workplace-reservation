import { Box, Button, Card, Stack, TextField, Typography } from '@mui/material'
import { Form, FormikProvider, useFormik } from 'formik'
import { Office } from './OfficeList'
import * as Yup from 'yup'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { useAuth } from '../../utils/AuthProvider'
import { useNavigate } from 'react-router-dom'

export function EditOffice({
  office,
  closeEdit,
}: {
  office?: Office
  closeEdit?: () => void
}) {
  const { jwtToken } = useAuth()
  const navigate = useNavigate()

  const isEdit = !!office

  const OfficeValidationSchema = Yup.object().shape({
    name: Yup.string().required('Name must be set'),
    location: Yup.string().required('Location must be set'),
  })

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: office?.Name.String ?? '',
      description: office?.Description.String ?? '',
      location: office?.location ?? '',
      locationUrl: office?.locationURL ?? '',
    },
    validationSchema: OfficeValidationSchema,
    onSubmit: async () => {
      await handleFormSubmission()
    },
  })

  const {
    errors,
    values,
    touched,
    handleSubmit,
    getFieldProps,
    setSubmitting,
    resetForm,
    setErrors,
  } = formik

  async function handleFormSubmission() {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      let requestUrl = BASE_URL + 'offices'

      const office: Office = (
        await axios.post(requestUrl, values, requestConfig)
      ).data
      resetForm()
      setSubmitting(false)
      toast.success(
        isEdit
          ? `Office ${office.Name.String} updated`
          : `Office ${office.Name.String} created!`
      )
      navigate('/offices', { replace: true })
    } catch (error: any) {
      console.log(error)
      setSubmitting(false)
      setErrors(error.message)
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant={'h6'} mb={2}>
          {isEdit ? 'Edit office' : 'Add new office'}
        </Typography>
        {closeEdit && <Button onClick={closeEdit}>Close</Button>}
      </Box>

      <FormikProvider value={formik}>
        <Form onSubmit={handleSubmit} autoComplete="off">
          <Stack spacing={3}>
            <TextField
              label={'Name'}
              {...getFieldProps('name')}
              error={Boolean(touched.name && errors.name)}
              helperText={touched.name && errors.name}
              autoFocus={isEdit}
            />
            <TextField
              label={'Description'}
              {...getFieldProps('description')}
            />
            <TextField
              label={'Location'}
              {...getFieldProps('location')}
              error={Boolean(touched.location && errors.location)}
              helperText={touched.location && errors.location}
            />
            <TextField
              label={'LocationURL'}
              {...getFieldProps('locationUrl')}
            />
            <Button
              type={'submit'}
              variant={'contained'}
              sx={{ width: 'max-content' }}
            >
              {isEdit ? 'Save changes' : 'Add Office'}
            </Button>
          </Stack>
        </Form>
      </FormikProvider>
    </Card>
  )
}
