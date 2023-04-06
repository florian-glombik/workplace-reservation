import { Box, Grid, IconButton, TextField, Tooltip } from '@mui/material'
import { Form, FormikProvider, useFormik } from 'formik'
import * as Yup from 'yup'
import axios, { AxiosRequestConfig } from 'axios'
import { BASE_URL } from '../../config'
import { toast } from 'react-toastify'
import { getDisplayResponseMessage } from '../../utils/NotificationUtil'
import { useAuth } from '../../utils/AuthProvider'
import AddIcon from '@mui/icons-material/Add'
import * as React from 'react'
import SaveIcon from '@mui/icons-material/Save'
import { WorkplaceWithoutReservations } from '../Workplace'
import { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'

export function CreateOrEditWorkplace({
  officeId,
  workplace,
}: {
  officeId: string
  workplace?: WorkplaceWithoutReservations
}) {
  const { jwtToken } = useAuth()
  const [changesWereMade, setChangesWereMade] = useState(false)

  const WorkplaceValidationSchema = Yup.object().shape({})
  const isEdit = !!workplace

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      Name: workplace?.Name.String ?? '',
      Description: workplace?.Description.String ?? '',
      OfficeID: officeId,
    },
    validationSchema: WorkplaceValidationSchema,
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
        values.Name === workplace.Name.String &&
        values.Description === workplace.Description.String
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
      let createdOrEditedWorkplace: WorkplaceWithoutReservations | undefined =
        undefined
      if (isEdit) {
        const requestUrl = BASE_URL + 'workplaces/' + workplace!.ID
        createdOrEditedWorkplace = (
          await axios.patch(requestUrl, values, requestConfig)
        ).data
      } else {
        const requestUrl = BASE_URL + 'workplaces'
        createdOrEditedWorkplace = (
          await axios.post(requestUrl, values, requestConfig)
        ).data
      }
      resetForm()
      setSubmitting(false)
      toast.success(
        isEdit
          ? `Workplace ${createdOrEditedWorkplace?.Name.String} updated`
          : `Workplace ${createdOrEditedWorkplace?.Name.String} created!`
      )

      if (isEdit) {
        workplace!.Name.String = values.Name
        workplace!.Description.String = values.Description
      }
    } catch (error: any) {
      console.error(error)
      setSubmitting(false)
      setErrors(error.message)
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <Box sx={{ m: 2 }}>
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
              <SubmitButton isEdit={isEdit} isDisabled={!changesWereMade} />
              {isEdit && <DeleteWorkplaceButton workplace={workplace!} />}
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </Box>
  )
}

function DeleteWorkplaceButton({
  workplace,
}: {
  workplace: WorkplaceWithoutReservations
}) {
  const { jwtToken } = useAuth()

  const handleDeleteWorkplace = async () => {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: 'Bearer ' + jwtToken,
      },
    }

    try {
      const requestUrl = BASE_URL + 'workplaces/' + workplace.ID
      await axios.delete(requestUrl, requestConfig)
      toast.success(
        `Workplace ${workplace?.Name.String} and associated reservations have been deleted!`
      )
    } catch (error: any) {
      console.error(error)
      toast.error(getDisplayResponseMessage(error))
    }
  }

  return (
    <IconButton onClick={handleDeleteWorkplace}>
      <Tooltip title={'Delete workplace and associated reservations'}>
        <DeleteIcon />
      </Tooltip>
    </IconButton>
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
    <IconButton
      color={'primary'}
      type={'submit'}
      disabled={isDisabled && isEdit}
    >
      {isEdit ? (
        <Tooltip title={'Save changes'}>
          <SaveIcon />
        </Tooltip>
      ) : (
        <Tooltip title={'Add new workplace'}>
          <AddIcon />
        </Tooltip>
      )}
    </IconButton>
  )
}
