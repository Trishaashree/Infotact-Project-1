import { useState } from 'react'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      })

      localStorage.setItem('token', res.data.token)

      alert('Login Success')

      window.location.href = '/pos'
    } catch (error) {
      alert('Login Failed')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[350px]">

        <h1 className="text-3xl font-bold mb-5 text-center">
          Retail POS Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="border w-full p-3 mb-4 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-3 mb-4 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white w-full p-3 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
}