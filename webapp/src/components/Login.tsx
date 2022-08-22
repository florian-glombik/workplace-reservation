import './Login.css'
import { useState, useRef, useEffect } from 'react'

const logLogin = (details: any) => {
  console.log(details)
}

export const Login = () => {
  const userRef = useRef();
  const errRef = useRef<HTMLInputElement | null>();

  useEffect(() => {
    const test = userRef.current
    console.log(test)
    // userRef.current.focus();
  }, [])

  const [details, setDetails] = useState({ email: '', password: '' })

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);


  useEffect(() => {
    setErrMsg('');
  }, [user, password])

  const handleLogin = async (e: any) => {
    e.preventDefault() // page shall not re-render
    logLogin(details)
    setSuccess(true)
  }

  return (
      <div>
        {success ? (
            <section>
              <h1>You are logged in!</h1>
              <br />
              <p>
                <a href="#">Go to Home</a>
              </p>
            </section>
        ) : (
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
                        // ref={userRef.current}
                        onChange={(e) => setDetails({ ...details, email: e.target.value })}
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
              <p className={'mt-4'}>
                Need an Account? <a href={'#'} className={'line'}>Register</a>
                {/*TODO put router link here*/}
              </p>
            </div>
        )}
      </div>
)
}
