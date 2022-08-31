import React from 'react'
import './App.css'
import { Login } from './components/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Registration } from './components/Registration'
import { Header } from './components/Header'
import { AuthProvider } from './utils/AuthProvider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { WorkplaceAccordions } from './components/WorkplaceAccordions'
import { PageNotFound } from './components/PageNotFound'
import { EditAccount } from './components/EditAccount'
import { ReoccurringReservations } from './components/ReoccurringReservations'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route
            path={'/'}
            element={
              <ProtectedRoute>
                <WorkplaceAccordions />
              </ProtectedRoute>
            }
          />
          <Route
            path={'/reservations/reoccurring'}
            element={
              <ProtectedRoute>
                <ReoccurringReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path={'/account/edit'}
            element={
              <ProtectedRoute>
                <EditAccount />
              </ProtectedRoute>
            }
          />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/registration'} element={<Registration />} />
          <Route path={'*'} element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </BrowserRouter>
  )
}

export default App
