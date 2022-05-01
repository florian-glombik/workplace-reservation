import React from 'react'

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
      <table>
        <tr>
          <th>Weekday</th>
          {this.workplaces.map((workplace) => (
            <th>{workplace.name}</th>
          ))}
        </tr>
        {weekDays.map((day) => {
          return (
            <tr>
              <td>{day}</td>
              {this.workplaces.map((workplace) => (
                <td>
                  <button>{workplace.id}</button>
                </td>
              ))}
            </tr>
          )
        })}
      </table>
    )
  }
}
