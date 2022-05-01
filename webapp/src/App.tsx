import React from 'react'
import './App.css'
import { Header } from './components/Header'
import { Login } from './components/Login'
import { Workplace, Workplaces } from './components/Workplace'

let workplaces: Workplace[] = []

function App() {
  return (
    <div className="App">
      <Header />
      <Login />
      {/*<Workplaces/>*/}
    </div>
  )
}

export default App
