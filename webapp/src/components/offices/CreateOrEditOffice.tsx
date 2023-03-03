import { Box, Grid, IconButton, TextField, Typography } from '@mui/material'
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

export function CreateOrEditOffice({ office }: { office?: Office }) {
  const { jwtToken } = useAuth()
  const navigate = useNavigate()

  const OfficeValidationSchema = Yup.object().shape({
    Name: Yup.string().required('Name must be set'),
    Location: Yup.string().required('Location must be set'),
  })

  const isEdit = !!office

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      Name: office?.Name.String ?? '',
      Description: office?.Description.String ?? '',
      Location: office?.Location ?? '',
      LocationUrl: office?.LocationUrl?.String ?? '',
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
      let createdOrEditedOffice: Office | undefined = undefined
      if (isEdit) {
        const requestUrl = BASE_URL + 'offices/' + office!.ID
        createdOrEditedOffice = (
          await axios.patch(requestUrl, values, requestConfig)
        ).data
      } else {
        const requestUrl = BASE_URL + 'offices'
        createdOrEditedOffice = (
          await axios.post(requestUrl, values, requestConfig)
        ).data
      }
      resetForm()
      setSubmitting(false)
      toast.success(
        isEdit
          ? `Office ${createdOrEditedOffice?.Name.String} updated`
          : `Office ${createdOrEditedOffice?.Name.String} created!`
      )
      navigate('/offices', { replace: true })
    } catch (error: any) {
      console.error(error)
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
              {...getFieldProps('Name')}
              error={Boolean(touched.Name && errors.Name)}
              helperText={touched.Name && errors.Name}
              autoFocus={isEdit}
            />
          </Grid>
          <Grid item>
            <TextField
              label={'Description'}
              {...getFieldProps('Description')}
            />
          </Grid>
          <Grid item>
            <TextField
              label={'Location'}
              {...getFieldProps('Location')}
              error={Boolean(touched.Location && errors.Location)}
              helperText={touched.Location && errors.Location}
            />
          </Grid>
          <Grid item>
            <TextField
              label={'LocationURL'}
              {...getFieldProps('LocationUrl')}
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
