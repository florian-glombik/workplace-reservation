import React from 'react'
import './App.css'
import { Login } from './components/Login'
import { Workplaces } from './components/Workplace'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Registration } from './components/Registration'
import { Header } from './components/Header'
import { AuthProvider } from './utils/AuthProvider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Header />
                <Workplaces />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
        </Routes>
      </AuthProvider>

      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
