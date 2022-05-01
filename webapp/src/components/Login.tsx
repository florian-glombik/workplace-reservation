import './Login.css'

export const Login = () => {
  return (
    <div className="d-flex justify-content-center">
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
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password"
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
    </div>
  )
}
