import { useEffect, useState } from 'react'
import AdminNav from '../components/AdminNav'
import ButtonLoader from '../components/ButtonLoader'
import PageLoader from '../components/PageLoader'
import PasswordField from '../components/PasswordField'
import api from '../services/api'

const categories = ['salon', 'clinic', 'coaching', 'spa', 'gym', 'other']
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function AdminSettingsPage({
  business,
  onBusinessSaved,
  setMessage,
  logoutAdmin,
  confirmAction,
  busyAction,
  setBusyAction,
}) {
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    category: 'salon',
    address: '',
    phone: '',
    ownerEmail: '',
    ownerPhone: '',
    openTime: '09:00',
    closeTime: '20:00',
    slotDuration: 30,
    autoGenerateSlots: true,
    bookingMode: 'slot',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    holidaysText: '',
    tokenAmount: 0,
    upiId: '',
    upiName: '',
  })
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (business) {
      setBusinessForm({
        businessName: business.name || '',
        category: business.category || 'salon',
        address: business.address || '',
        phone: business.phone || '',
        ownerEmail: business.ownerEmail || '',
        ownerPhone: business.ownerPhone || '',
        openTime: business.openTime || '09:00',
        closeTime: business.closeTime || '20:00',
        slotDuration: business.slotDuration || 30,
        autoGenerateSlots: business.autoGenerateSlots ?? true,
        bookingMode: business.bookingMode || 'slot',
        workingDays: business.workingDays?.length
          ? business.workingDays
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        holidaysText: business.holidays?.join(', ') || '',
        tokenAmount: business.tokenAmount || 0,
        upiId: business.upiId || '',
        upiName: business.upiName || '',
      })
    }
  }, [business])

  useEffect(() => {
    async function loadOwner() {
      setLoading(true)
      try {
        const response = await api.get('/auth/me')
        const user = response.data.user
        setOwnerForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
        })
      } catch (error) {
        setMessage(error.response?.data?.message || 'Could not load owner account.')
      } finally {
        setLoading(false)
      }
    }

    loadOwner()
  }, [setMessage])

  function updateBusinessField(field, value) {
    setBusinessForm((current) => ({ ...current, [field]: value }))
  }

  function toggleWorkingDay(day) {
    setBusinessForm((current) => {
      const days = current.workingDays.includes(day)
        ? current.workingDays.filter((item) => item !== day)
        : [...current.workingDays, day]
      return { ...current, workingDays: weekDays.filter((item) => days.includes(item)) }
    })
  }

  function updateOwnerField(field, value) {
    setOwnerForm((current) => ({ ...current, [field]: value }))
  }

  async function saveBusiness(event) {
    event.preventDefault()
    if (
      !(await confirmAction({
        title: 'Save business settings?',
        body: 'Public business details, payment settings, and schedule rules will be updated.',
        confirmLabel: 'Save settings',
      }))
    ) {
      return
    }
    setBusyAction('save-business')

    try {
      const response = await api.put('/business', {
        ...businessForm,
        slotDuration: Number(businessForm.slotDuration),
        autoGenerateSlots: Boolean(businessForm.autoGenerateSlots),
        bookingMode: businessForm.bookingMode,
        workingDays: businessForm.workingDays,
        holidays: businessForm.holidaysText
          .split(',')
          .map((holiday) => holiday.trim())
          .filter(Boolean),
        tokenAmount: Number(businessForm.tokenAmount),
      })
      onBusinessSaved(response.data.data)
      setMessage('Business details saved.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save business details.')
    } finally {
      setBusyAction('')
    }
  }

  async function saveOwner(event) {
    event.preventDefault()
    if (
      !(await confirmAction({
        title: 'Save owner account?',
        body: ownerForm.password
          ? 'Owner contact details and password will be updated.'
          : 'Owner contact details will be updated.',
        confirmLabel: 'Save owner',
      }))
    ) {
      return
    }
    setBusyAction('save-owner')

    try {
      const payload = {
        name: ownerForm.name,
        email: ownerForm.email,
        phone: ownerForm.phone,
      }

      if (ownerForm.password) {
        payload.password = ownerForm.password
      }

      const response = await api.put('/auth/me', payload)
      const user = response.data.user
      setOwnerForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
      })
      setMessage('Owner details saved.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save owner details.')
    } finally {
      setBusyAction('')
    }
  }

  if (loading) return <PageLoader label="Loading settings" />

  return (
    <section className="grid gap-5">
      <AdminNav logoutAdmin={logoutAdmin} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form className="panel grid gap-4" onSubmit={saveBusiness}>
          <div className="section-heading">
            <span className="eyebrow">Business profile</span>
            <h2>Public details</h2>
          </div>

          <div className="rounded-lg border border-zinc-900/10 bg-zinc-950 p-4 text-white shadow-[0_18px_50px_rgba(24,24,27,0.18)]">
            <strong className="block text-lg font-black text-white">{businessForm.businessName || 'Business profile'}</strong>
            <p className="mt-1 text-sm font-bold text-zinc-300">
              {businessForm.openTime} to {businessForm.closeTime}
              {businessForm.upiId ? ` - UPI ${businessForm.upiId}` : ''}
            </p>
          </div>

          <label className="form-label">
            Business name
            <input
              className="form-field"
              value={businessForm.businessName}
              onChange={(event) => updateBusinessField('businessName', event.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Category
            <select
              className="form-field"
              value={businessForm.category}
              onChange={(event) => updateBusinessField('category', event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Address
            <textarea
              className="form-field min-h-24 resize-y"
              value={businessForm.address}
              onChange={(event) => updateBusinessField('address', event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              Business phone
              <input
                className="form-field"
                value={businessForm.phone}
                onChange={(event) => updateBusinessField('phone', event.target.value)}
              />
            </label>
            <label className="form-label">
              Owner phone
              <input
                className="form-field"
                value={businessForm.ownerPhone}
                onChange={(event) => updateBusinessField('ownerPhone', event.target.value)}
              />
            </label>
          </div>

          <label className="form-label">
            Owner email
            <input
              className="form-field"
              type="email"
              value={businessForm.ownerEmail}
              onChange={(event) => updateBusinessField('ownerEmail', event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              Opens at
              <input
                className="form-field"
                type="time"
                value={businessForm.openTime}
                onChange={(event) => updateBusinessField('openTime', event.target.value)}
              />
            </label>
            <label className="form-label">
              Closes at
              <input
                className="form-field"
                type="time"
                value={businessForm.closeTime}
                onChange={(event) => updateBusinessField('closeTime', event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              Slot duration
              <input
                className="form-field"
                type="number"
                min="5"
                value={businessForm.slotDuration}
                onChange={(event) => updateBusinessField('slotDuration', event.target.value)}
              />
            </label>
            <label className="form-label">
              Default token
              <input
                className="form-field"
                type="number"
                min="0"
                value={businessForm.tokenAmount}
                onChange={(event) => updateBusinessField('tokenAmount', event.target.value)}
              />
            </label>
          </div>

          <label
            className={`grid cursor-pointer gap-2 rounded-lg border p-4 transition ${
              businessForm.autoGenerateSlots
                ? 'border-emerald-200 bg-emerald-50/80 text-zinc-950'
                : 'border-zinc-200 bg-white/80 text-zinc-600'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-black">Auto-generate daily slots</span>
                <span className="mt-1 block text-sm font-semibold text-zinc-500">
                  Creates slots from business hours using slot duration, except holidays and off days.
                </span>
              </span>
              <input
                className="h-5 w-5 accent-emerald-500"
                type="checkbox"
                checked={businessForm.autoGenerateSlots}
                onChange={(event) => updateBusinessField('autoGenerateSlots', event.target.checked)}
              />
            </span>
          </label>

          <div className="grid gap-3">
            <span className="text-sm font-bold text-slate-950">Booking mode</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  value: 'slot',
                  title: 'Slot based',
                  description: 'Customers choose from generated available slots.',
                },
                {
                  value: 'flexible',
                  title: 'Flexible request',
                  description: 'Customers request any time and admin can suggest a better time.',
                },
              ].map((mode) => (
                <label
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    businessForm.bookingMode === mode.value
                      ? 'border-zinc-950 bg-zinc-950 text-white shadow-[0_10px_22px_rgba(24,24,27,0.16)]'
                      : 'border-zinc-200 bg-white/80 text-zinc-600'
                  }`}
                  key={mode.value}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="bookingMode"
                    value={mode.value}
                    checked={businessForm.bookingMode === mode.value}
                    onChange={(event) => updateBusinessField('bookingMode', event.target.value)}
                  />
                  <span className="block text-sm font-black">{mode.title}</span>
                  <span className="mt-1 block text-sm font-semibold opacity-75">{mode.description}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <span className="text-sm font-bold text-slate-950">Working days</span>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <label
                  className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-extrabold ${
                    businessForm.workingDays.includes(day)
                      ? 'border-zinc-950 bg-zinc-950 text-white shadow-[0_10px_22px_rgba(24,24,27,0.16)]'
                      : 'border-zinc-200 bg-white/80 text-zinc-500'
                  }`}
                  key={day}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={businessForm.workingDays.includes(day)}
                    onChange={() => toggleWorkingDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <label className="form-label">
            Holidays
            <input
              className="form-field"
              value={businessForm.holidaysText}
              onChange={(event) => updateBusinessField('holidaysText', event.target.value)}
              placeholder="2026-07-01, 2026-08-15"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-label">
              UPI ID
              <input
                className="form-field"
                value={businessForm.upiId}
                onChange={(event) => updateBusinessField('upiId', event.target.value)}
                required
              />
            </label>
            <label className="form-label">
              UPI name
              <input
                className="form-field"
                value={businessForm.upiName}
                onChange={(event) => updateBusinessField('upiName', event.target.value)}
              />
            </label>
          </div>

          <button className="btn-primary justify-self-start" type="submit" disabled={busyAction === 'save-business'}>
            {busyAction === 'save-business' && <ButtonLoader />}
            {busyAction === 'save-business' ? 'Saving business' : 'Save business'}
          </button>
        </form>

        <form className="panel grid gap-4" onSubmit={saveOwner}>
          <div className="section-heading">
            <span className="eyebrow">Owner account</span>
            <h2>Login and contact</h2>
          </div>

          <label className="form-label">
            Owner name
            <input
              className="form-field"
              value={ownerForm.name}
              onChange={(event) => updateOwnerField('name', event.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Login email
            <input
              className="form-field"
              type="email"
              value={ownerForm.email}
              onChange={(event) => updateOwnerField('email', event.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Owner phone
            <input
              className="form-field"
              value={ownerForm.phone}
              onChange={(event) => updateOwnerField('phone', event.target.value)}
              required
            />
          </label>

          <label className="form-label">
            New password
            <PasswordField
              value={ownerForm.password}
              onChange={(event) => updateOwnerField('password', event.target.value)}
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <button className="btn-primary justify-self-start" type="submit" disabled={busyAction === 'save-owner'}>
            {busyAction === 'save-owner' && <ButtonLoader />}
            {busyAction === 'save-owner' ? 'Saving owner' : 'Save owner'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AdminSettingsPage
