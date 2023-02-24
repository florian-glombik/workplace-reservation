import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { WorkplaceAccordions } from './components/WorkplaceAccordions'
import { FixedOccupancyPlanOverview } from './components/FixedOccupancyPlanOverview'
import { RecurringReservations } from './components/reoccurringReservations/RecurringReservations'
import { EditAccount } from './components/EditAccount'
import { Login } from './components/Login'
import { Registration } from './components/Registration'
import { PageNotFound } from './components/PageNotFound'
import React from 'react'
import { EditOfficesPage } from './components/EditOfficesPage'

export function Router() {
  return (
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
        path={'/fixed-occupancy-plan'}
        element={
          <ProtectedRoute>
            <FixedOccupancyPlanOverview />
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
      <Route
        path={'/reservations/recurring'}
        element={
          <ProtectedRoute>
            <RecurringReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path={'/offices'}
        element={
          <ProtectedRoute>
            <EditOfficesPage />
          </ProtectedRoute>
        }
      />
      <Route path={'/login'} element={<Login />} />
      <Route path={'/registration'} element={<Registration />} />
      <Route path={'*'} element={<PageNotFound />} />
    </Routes>
  )
}
