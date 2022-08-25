import './Login.css'
import { useState, useRef, useEffect } from 'react'
import {AuthProvider} from "../utils/AuthProvider";

export const Registration = () => {
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
    setSuccess(true)
  }

  return (
      <div>
        <h1>Registration</h1>
        TODO
      </div>
    )
}
