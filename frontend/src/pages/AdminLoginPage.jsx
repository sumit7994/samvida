import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ButtonLoader from '../components/ButtonLoader'
import api from '../services/api'

function AdminLoginPage({ setMessage, onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/login', credentials)
      localStorage.setItem('samvida_admin_token', response.data.token)
      setMessage('Admin logged in.')
      await onLogin?.()
      navigate(location.state?.from?.pathname || '/admin', { replace: true })
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <form className="panel grid gap-4" onSubmit={handleSubmit}>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg border border-white/80 bg-white shadow-sm">
          <img src="/favicon1.png" alt="Samvida" className="h-14 w-14 object-contain" />
        </div>
        <div className="section-heading">
          <span className="eyebrow">Admin access</span>
          <h2>Login to business dashboard</h2>
        </div>

        <label className="form-label">
          Email
          <input
            className="form-field"
            type="email"
            value={credentials.email}
            onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
            placeholder="owner@example.com"
          />
        </label>

        <label className="form-label">
          Password
          <input
            className="form-field"
            type="password"
            value={credentials.password}
            onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
            placeholder="Enter password"
          />
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading && <ButtonLoader />}
          {loading ? 'Logging in' : 'Login'}
        </button>
      </form>
    </section>
  )
}

export default AdminLoginPage
