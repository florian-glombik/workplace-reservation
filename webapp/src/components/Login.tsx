import './Login.css'
import { useState } from 'react'

const login = (details: any) => {
  console.log(details)
}

export const Login = () => {
  const [details, setDetails] = useState({ email: '', password: '' })

  const loginHandler = (e: any) => {
    e.preventDefault() // page shall not re-render
    login(details)
  }

  return (
    <form className="d-flex justify-content-center" onSubmit={loginHandler}>
      <div style={{ maxWidth: '20rem' }}>
        {' '}
        <div className="form-group mt-3">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            placeholder="Enter email"
            onChange={(e) => setDetails({ ...details, email: e.target.value })}
            value={details.email}
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password"
            onChange={(e) =>
              setDetails({ ...details, password: e.target.value })
            }
            value={details.password}
          />
        </div>
        <div className="d-flex justify-content-between mt-4">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <button type="submit" className="btn btn-secondary">
            Register
          </button>
        </div>
      </div>
    </form>
  )
}
