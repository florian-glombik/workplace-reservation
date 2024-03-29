import { format } from 'date-fns'
import { ACCORDION_LABEL_DATE_FORMAT } from '../components/Workplace'

export function formatDateToString(date: Date): string {
  return format(date, ACCORDION_LABEL_DATE_FORMAT)
}
