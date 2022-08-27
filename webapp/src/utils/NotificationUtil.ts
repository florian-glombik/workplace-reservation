import { AxiosError } from 'axios'

interface ErrorResponse {
  message: string
  reason: string
}

export function getDisplayResponseMessage(error: AxiosError<ErrorResponse>) {
  return error.response?.data.message ?? error.message
}
