import React from 'react'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './components/Header'
import { AuthProvider } from './utils/AuthProvider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Router } from './Router'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

export function composeBackendUrl(path: string) {
    return BACKEND_URL + (path.startsWith("/") ? path : `/${path}`)
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Router />
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
