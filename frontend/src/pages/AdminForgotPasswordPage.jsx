import { Link } from 'react-router-dom'
import { useState } from 'react'
import ButtonLoader from '../components/ButtonLoader'
import api from '../services/api'

function AdminForgotPasswordPage({ setMessage }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    setLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', { email })
      const message = response.data.message || 'If this email exists, a reset link has been sent.'
      setStatus(message)
      setMessage(message)
    } catch (error) {
      setError(error.response?.data?.message || 'Could not request password reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <form className="panel grid gap-4" onSubmit={handleSubmit}>
        <div className="section-heading">
          <span className="eyebrow">Admin recovery</span>
          <h2>Reset password</h2>
        </div>

        <label className="form-label">
          Admin email
          <input
            className="form-field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="owner@example.com"
            required
          />
        </label>

        {status && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{status}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading && <ButtonLoader />}
          {loading ? 'Sending link' : 'Send reset link'}
        </button>

        <Link className="btn-secondary" to="/admin/login">
          Back to login
        </Link>
      </form>
    </section>
  )
}

export default AdminForgotPasswordPage
