import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import ButtonLoader from '../components/ButtonLoader'
import PasswordField from '../components/PasswordField'
import api from '../services/api'

function AdminResetPasswordPage({ setMessage }) {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password })
      setMessage('Password reset successfully. You can login now.')
      navigate('/admin/login', { replace: true })
    } catch (error) {
      setError(error.response?.data?.message || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl">
      <form className="panel grid gap-4" onSubmit={handleSubmit}>
        <div className="section-heading">
          <span className="eyebrow">Admin recovery</span>
          <h2>Create new password</h2>
        </div>

        <label className="form-label">
          New password
          <PasswordField
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="At least 6 characters"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </label>

        <label className="form-label">
          Confirm password
          <PasswordField
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            placeholder="Repeat new password"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading && <ButtonLoader />}
          {loading ? 'Resetting' : 'Reset password'}
        </button>

        <Link className="btn-secondary" to="/admin/login">
          Back to login
        </Link>
      </form>
    </section>
  )
}

export default AdminResetPasswordPage
