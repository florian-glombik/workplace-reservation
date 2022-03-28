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

const weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export class Workplaces extends React.Component {
  workplaces: Workplace[] = [{
    id: "id1",
    name: "ubuntu",
    reservations: []
  }, {
    id: "id2",
    name: "ubuntu",
    reservations: []
  }]

  render() {
    return <div>
      {
        weekDays.map(day => {
          return <div>
            {day}
            {
              this.workplaces.map(workplace => {
                return <button>{workplace.id}</button>
              })
            }
          </div>
        })
      }
    </div>
    // return <div>
    //   <ul>
    //     {
    //       this.workplaces.map(workplace => {
    //         return <li key={workplace.id}>{workplace.id}: {workplace.name}`</li>
    //       })
    //     }
    //   </ul>
    // </div>
  }
}
