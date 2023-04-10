import React from 'react'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './components/Header'
import { AuthProvider } from './utils/AuthProvider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Router } from './Router'

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
