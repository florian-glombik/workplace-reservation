import './Login.css'
import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from '../utils/AuthProvider'
import axios from 'axios'
import { BASE_URL } from '../config'

const logLogin = (details: any) => {
  console.log(details)
}

export const Login = () => {
  // @ts-ignore
  const { login } = useAuth()
  const [details, setDetails] = useState({ email: '', password: '' })

  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setErrMsg('')
  }, [user, password])

  const handleLogin = async (e: any) => {
    e.preventDefault() // page shall not re-render
    logLogin(details)
    setSuccess(true)

    setErrMsg('there is an error')

    const jwtToken = await axios.get(BASE_URL + 'login')
    console.log(jwtToken.data)
    login({ user: 'test' })
  }

  return (
    <div>
      <form className="d-flex justify-content-center" onSubmit={handleLogin}>
        <div style={{ maxWidth: '20rem' }}>
          <p>{errMsg}</p>
          <h1>Sign In</h1>
          <div className="form-group mt-3">
            <label htmlFor="eMailInput">Email address</label>
            <input
              type="email"
              id="eMailInput"
              onChange={(e) =>
                setDetails({ ...details, email: e.target.value })
              }
              value={details.email}
              required
              className="form-control"
              placeholder="E-Mail"
              autoFocus
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="passwordInput">Password</label>
            <input
              type="password"
              id="passwordInput"
              onChange={(e) =>
                setDetails({ ...details, password: e.target.value })
              }
              value={details.password}
              required
              className="form-control"
              placeholder="Password"
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Login
          </button>
        </div>
      </form>
      <p className={'d-flex justify-content-center mt-4'}>
        <a href={'registration'} className={'line'}>
          Don't have an account? Register
        </a>
      </p>
    </div>
  )
}
