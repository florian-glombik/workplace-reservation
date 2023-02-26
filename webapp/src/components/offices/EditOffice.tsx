import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { Form, FormikProvider, useFormik } from 'formik'
import { Office } from './OfficeList'
import * as Yup from 'yup'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { useAuth } from '../../utils/AuthProvider'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import * as React from 'react'
import SaveIcon from '@mui/icons-material/Save'

export function EditOffice({ office }: { office?: Office }) {
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
    <FormikProvider value={formik}>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              label={'Name'}
              {...getFieldProps('name')}
              error={Boolean(touched.name && errors.name)}
              helperText={touched.name && errors.name}
              autoFocus={isEdit}
            />
          </Grid>
          <Grid item>
            {' '}
            <TextField
              label={'Description'}
              {...getFieldProps('description')}
            />
          </Grid>
          <Grid item>
            {' '}
            <TextField
              label={'Location'}
              {...getFieldProps('location')}
              error={Boolean(touched.location && errors.location)}
              helperText={touched.location && errors.location}
            />
          </Grid>
          <Grid item>
            {' '}
            <TextField
              label={'LocationURL'}
              {...getFieldProps('locationUrl')}
            />
          </Grid>
          <Grid item>
            <SubmitButton isEdit={isEdit} />
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  )
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  return (
    <IconButton color={'primary'} type={'submit'}>
      {isEdit ? (
        <Box sx={{ display: 'flex' }}>
          <SaveIcon />
          &nbsp;
          <Typography>Save changes</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex' }}>
          <AddIcon />
          &nbsp;
          <Typography>Add new office</Typography>
        </Box>
      )}
    </IconButton>
  )
}
