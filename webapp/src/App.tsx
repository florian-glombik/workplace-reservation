import React from 'react'
import './App.css'
import { Login } from './components/Login'
import { Workplace, Workplaces } from './components/Workplace'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Registration } from './components/Registration'
import { Header } from './components/Header'
import { AuthProvider } from './utils/AuthProvider'

let workplaces: Workplace[] = []

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
