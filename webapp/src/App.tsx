import React from 'react'
import './App.css'
import { Header } from './components/Header'
import { Login } from './components/Login'
import { Workplace, Workplaces } from './components/Workplace'
import {BrowserRouter, Route, Router, Routes} from "react-router-dom";

let workplaces: Workplace[] = []

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route
                  path='/'
                  element={<Workplaces/>}
              />
              <Route
                  path='/login'
                  element={<Login/>}
              />
          </Routes>
      </BrowserRouter>
  )
}

export default App