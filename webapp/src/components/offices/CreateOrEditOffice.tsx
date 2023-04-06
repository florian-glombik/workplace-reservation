import {
  Box,
  Grid,
  IconButton,
  TextField,
  Tooltip,
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
import { OfficeWithWorkplaces } from '../../pages/EditOfficePage'
import { CreateOrEditWorkplace } from './CreateOrEditWorkplace'
import { useEffect, useState } from 'react'

export function CreateOrEditOffice({
  officeWithWorkplaces,
}: {
  officeWithWorkplaces?: OfficeWithWorkplaces
}) {
  const { jwtToken } = useAuth()
  const navigate = useNavigate()
  const [changesWereMade, setChangesWereMade] = useState(false)

  const OfficeValidationSchema = Yup.object().shape({
    Name: Yup.string().required('Office name must be set'),
    Location: Yup.string().required('Location must be set'),
  })

  const isEdit = !!officeWithWorkplaces

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      Name: officeWithWorkplaces?.Office.Name.String ?? '',
      Description: officeWithWorkplaces?.Office.Description.String ?? '',
      Location: officeWithWorkplaces?.Office.Location ?? '',
      LocationUrl: officeWithWorkplaces?.Office.LocationUrl?.String ?? '',
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

  useEffect(() => {
    if (!isEdit) {
      return
    }

    setChangesWereMade(
      !(
        values.Name === officeWithWorkplaces?.Office.Name.String &&
        values.Description ===
          officeWithWorkplaces?.Office.Description.String &&
        values.Location === officeWithWorkplaces?.Office.Location &&
        values.LocationUrl === officeWithWorkplaces?.Office.LocationUrl?.String
      )
    )
  }, [values])

  async function handleFormSubmission() {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      let createdOrEditedOffice: Office | undefined = undefined
      if (isEdit) {
        const requestUrl =
          BASE_URL + 'offices/' + officeWithWorkplaces!.Office.ID
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

  const noWorkplaceLoaded = officeWithWorkplaces?.Workplaces?.length ?? 0 < 1

  return (
    <Box>
      <FormikProvider value={formik}>
        <Form onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={2}>
            <Grid item>
              <TextField
                label={'Office name'}
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
      <Typography sx={{ mt: 3 }} variant={'h6'}>
        Associated Workplaces
      </Typography>
      {officeWithWorkplaces && (
        <CreateOrEditWorkplace officeId={officeWithWorkplaces.Office.ID} />
      )}
      {officeWithWorkplaces?.Workplaces?.map((workplace) => (
        <CreateOrEditWorkplace
          key={`create-or-edit-workplace-${workplace.ID}`}
          officeId={officeWithWorkplaces.Office.ID}
          workplace={workplace}
        />
      ))}
    </Box>
  )
}

function SubmitButton({
  isEdit,
  isDisabled = false,
}: {
  isEdit: boolean
  isDisabled?: boolean
}) {
  return (
    <IconButton color={'primary'} type={'submit'} disabled={isDisabled}>
      {isEdit ? (
        <Tooltip title={'Save changes'}>
          <SaveIcon />
        </Tooltip>
      ) : (
        <Tooltip title={'Add new office'}>
          <AddIcon />
        </Tooltip>
      )}
    </IconButton>
  )
}
