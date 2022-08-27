import React from 'react'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'

export type Workplace = {
  id: string
  name: string
  reservations: Reservation[]
  office?: Office
  description?: string
}

export type Reservation = {
  id: string
  user: User
  start: string
  end: string
}

export type Office = {
  id: string
  name: string
}

export type User = {
  id: string
  name: string
}

const weekDays: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export class Workplaces extends React.Component {
  workplaces: Workplace[] = [
    {
      id: 'id1',
      name: 'ubuntu',
      reservations: [],
    },
    {
      id: 'id2',
      name: 'mint',
      reservations: [],
    },
  ]

  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Weekday</TableCell>
            {this.workplaces.map((workplace) => (
              <TableCell>{workplace.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {weekDays.map((day) => {
            return (
              <TableRow>
                <TableCell>{day}</TableCell>
                {this.workplaces.map((workplace) => (
                  <TableCell>
                    <Button variant={'contained'}>{workplace.id}</Button>
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }
}
