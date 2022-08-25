import React from 'react'
import './App.css'
import { Login } from './components/Login'
import { Workplace, Workplaces } from './components/Workplace'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Registration } from './components/Registration'
import { Header } from './components/Header'

let workplaces: Workplace[] = []

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Workplaces />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
