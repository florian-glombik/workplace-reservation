import React, { useState } from 'react'
import './App.css'
import { Login } from './components/Login'
import { Workplaces } from './components/Workplaces'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Registration } from './components/Registration'
import { Header } from './components/Header'
import { AuthProvider } from './utils/AuthProvider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { addDays, endOfWeek, nextMonday, startOfWeek } from 'date-fns'
import { MultipleWorkplaces } from './components/MultipleWorkplaces'

export const MONDAY_NUMBER_CODE = 1
export const WEEK_STARTS_ON_MONDAY = { weekStartsOn: MONDAY_NUMBER_CODE }

const WEEKS_BEFORE_DEFAULT = 2
const WEEKS_AFTER_DEFAULT = 4
export const DAYS_PER_WEEK = 7

function App() {
  const [today] = useState(Date.now())
  // @ts-ignore
  const startOfTheWeek = startOfWeek(today, WEEK_STARTS_ON_MONDAY)
  // @ts-ignore
  const endOfTheWeek = endOfWeek(today, WEEK_STARTS_ON_MONDAY)

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Header />
                <MultipleWorkplaces
                  startDate={addDays(
                    startOfTheWeek,
                    -WEEKS_BEFORE_DEFAULT * DAYS_PER_WEEK
                  )}
                  endDate={addDays(endOfTheWeek, -DAYS_PER_WEEK)}
                ></MultipleWorkplaces>
                <Workplaces
                  startOfTheWeek={startOfTheWeek}
                  endOfTheWeek={endOfTheWeek}
                  defaultExpanded={true}
                />
                <MultipleWorkplaces
                  startDate={nextMonday(startOfTheWeek)}
                  endDate={addDays(
                    endOfTheWeek,
                    WEEKS_AFTER_DEFAULT * DAYS_PER_WEEK
                  )}
                ></MultipleWorkplaces>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
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
