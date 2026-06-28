import { useEffect, useState } from 'react'
import AdminBooking from '../components/AdminBooking'
import AdminNav from '../components/AdminNav'
import ButtonLoader from '../components/ButtonLoader'
import Metric from '../components/Metric'
import { today } from '../data/constants'

function AdminPage({
  bookings,
  pendingBookings,
  upiBookings,
  confirmedToday,
  tokenAmount,
  setTokenAmount,
  serviceName,
  approveBooking,
  rejectBooking,
  proposeBookingTime,
  confirmUpi,
  addWalkIn,
  logoutAdmin,
  services,
  slotDate,
  setSlotDate,
  slotTimes,
  loading,
  busyAction,
}) {
  const [rejectModal, setRejectModal] = useState({
    booking: null,
    reason: '',
  })
  const [proposeModal, setProposeModal] = useState({
    booking: null,
    date: today,
    time: '',
    note: '',
  })
  const [walkInModalOpen, setWalkInModalOpen] = useState(false)
  const [walkInForm, setWalkInForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    serviceId: '',
    date: slotDate,
    time: '',
    notes: '',
  })

  useEffect(() => {
    setWalkInForm((current) => ({
      ...current,
      serviceId: current.serviceId || services[0]?.id || '',
      date: slotDate,
      time: slotTimes.includes(current.time) ? current.time : slotTimes[0] || '',
    }))
  }, [services, slotDate, slotTimes])

  function openRejectModal(booking) {
    setRejectModal({ booking, reason: '' })
  }

  function closeRejectModal() {
    setRejectModal({ booking: null, reason: '' })
  }

  function openProposeModal(booking) {
    setProposeModal({
      booking,
      date: booking.date || today,
      time: booking.time || '',
      note: '',
    })
  }

  function closeProposeModal() {
    setProposeModal({ booking: null, date: today, time: '', note: '' })
  }

  async function submitReject(event) {
    event.preventDefault()
    if (!rejectModal.booking) return

    await rejectBooking(rejectModal.booking.id, rejectModal.reason)
    closeRejectModal()
  }

  async function submitProposal(event) {
    event.preventDefault()
    if (!proposeModal.booking) return

    const sent = await proposeBookingTime(proposeModal.booking.id, {
      date: proposeModal.date,
      time: proposeModal.time,
      note: proposeModal.note,
    })
    if (sent) closeProposeModal()
  }

  function openWalkInModal() {
    setWalkInModalOpen(true)
  }

  function closeWalkInModal() {
    if (busyAction) return
    setWalkInModalOpen(false)
  }

  function updateWalkInField(field, value) {
    if (field === 'date') {
      setSlotDate(value)
    }
    setWalkInForm((current) => ({ ...current, [field]: value }))
  }

  async function submitWalkIn(event) {
    event.preventDefault()
    const created = await addWalkIn(walkInForm)
    if (created) {
      setWalkInModalOpen(false)
      setWalkInForm((current) => ({
        ...current,
        customerName: '',
        phone: '',
        email: '',
        notes: '',
      }))
    }
  }

  return (
    <section className="grid gap-5">
      <AdminNav logoutAdmin={logoutAdmin} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pending" value={pendingBookings.length} />
        <Metric label="UPI claims" value={upiBookings.length} />
        <Metric label="Confirmed today" value={confirmedToday.length} />
        <Metric label="Total bookings" value={bookings.length} />
      </div>

      {loading && <p className="empty-state">Refreshing admin data...</p>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="panel">
          <div className="section-heading">
            <span className="eyebrow">Review queue</span>
            <h2>Pending requests</h2>
          </div>

          <label className="form-label mb-4">
            Token amount
            <input
              className="form-field"
              type="number"
              min="0"
              value={tokenAmount}
              onChange={(event) => setTokenAmount(event.target.value)}
            />
          </label>

          <div className="grid gap-3">
            {pendingBookings.map((booking) => (
              <AdminBooking
                key={booking.id}
                booking={booking}
                serviceName={serviceName}
                primaryLabel={
                  booking.timeProposal?.date && !booking.timeProposal.customerConfirmed
                    ? 'Awaiting customer'
                    : 'Approve'
                }
                onPrimary={() => approveBooking(booking.id)}
                secondaryLabel="Reject"
                onSecondary={() => openRejectModal(booking)}
                tertiaryLabel="Suggest time"
                onTertiary={() => openProposeModal(booking)}
                primaryLoading={busyAction === `approve:${booking.id}`}
                secondaryLoading={busyAction === `reject:${booking.id}`}
                tertiaryLoading={busyAction === `propose:${booking.id}`}
                primaryDisabled={booking.timeProposal?.date && !booking.timeProposal.customerConfirmed}
                disabled={Boolean(busyAction)}
              />
            ))}
            {pendingBookings.length === 0 && <p className="empty-state">No pending requests.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <span className="eyebrow">Payment desk</span>
            <h2>UPI verification</h2>
          </div>
          <div className="grid gap-3">
            {upiBookings.map((booking) => (
              <AdminBooking
                key={booking.id}
                booking={booking}
                serviceName={serviceName}
                primaryLabel="Confirm UPI"
                onPrimary={() => confirmUpi(booking.id)}
                secondaryLabel="Cancel"
                onSecondary={() => rejectBooking(booking.id)}
                primaryLoading={busyAction === `confirm-upi:${booking.id}`}
                secondaryLoading={busyAction === `reject:${booking.id}`}
                disabled={Boolean(busyAction)}
              />
            ))}
            {upiBookings.length === 0 && <p className="empty-state">No UPI claims.</p>}
          </div>
          <button className="btn-secondary mt-4 w-full" disabled={busyAction === 'walkin'} onClick={openWalkInModal}>
            {busyAction === 'walkin' && <ButtonLoader />}
            {busyAction === 'walkin' ? 'Adding walk-in' : 'Add walk-in booking'}
          </button>
        </div>
      </div>

      {rejectModal.booking && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyAction) {
              closeRejectModal()
            }
          }}
        >
          <form
            className="modal-panel max-w-lg"
            onSubmit={submitReject}
          >
            <div className="section-heading mb-0">
              <span className="eyebrow">Reject request</span>
              <h2>{rejectModal.booking.customerName}</h2>
            </div>

            <p className="text-sm text-slate-500">
              {serviceName(rejectModal.booking.serviceId)} - {rejectModal.booking.date} at{' '}
              {rejectModal.booking.time}
            </p>

            <label className="form-label">
              Reason
              <textarea
                className="form-field min-h-28 resize-y"
                value={rejectModal.reason}
                onChange={(event) =>
                  setRejectModal((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="Optional reason shown in customer email and booking status"
                disabled={Boolean(busyAction)}
              />
            </label>

            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={closeRejectModal} disabled={Boolean(busyAction)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="submit"
                disabled={busyAction === `reject:${rejectModal.booking.id}`}
              >
                {busyAction === `reject:${rejectModal.booking.id}` && <ButtonLoader />}
                {busyAction === `reject:${rejectModal.booking.id}` ? 'Rejecting' : 'Reject booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {proposeModal.booking && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyAction) {
              closeProposeModal()
            }
          }}
        >
          <form className="modal-panel max-w-lg" onSubmit={submitProposal}>
            <div className="section-heading mb-0">
              <span className="eyebrow">Suggest time</span>
              <h2>{proposeModal.booking.customerName}</h2>
            </div>

            <p className="text-sm text-slate-500">
              Current request: {serviceName(proposeModal.booking.serviceId)} - {proposeModal.booking.date} at{' '}
              {proposeModal.booking.time}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-label">
                Suggested date
                <input
                  className="form-field"
                  min={today}
                  type="date"
                  value={proposeModal.date}
                  onChange={(event) =>
                    setProposeModal((current) => ({ ...current, date: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="form-label">
                Suggested time
                <input
                  className="form-field"
                  type="time"
                  value={proposeModal.time}
                  onChange={(event) =>
                    setProposeModal((current) => ({ ...current, time: event.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <label className="form-label">
              Note
              <textarea
                className="form-field min-h-24 resize-y"
                value={proposeModal.note}
                onChange={(event) =>
                  setProposeModal((current) => ({ ...current, note: event.target.value }))
                }
                placeholder="Optional message shown in customer email"
              />
            </label>

            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={closeProposeModal} disabled={Boolean(busyAction)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="submit"
                disabled={busyAction === `propose:${proposeModal.booking.id}`}
              >
                {busyAction === `propose:${proposeModal.booking.id}` && <ButtonLoader />}
                {busyAction === `propose:${proposeModal.booking.id}` ? 'Sending' : 'Send suggestion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {walkInModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeWalkInModal()
            }
          }}
        >
          <form
            className="modal-panel max-w-2xl"
            onSubmit={submitWalkIn}
          >
            <div className="section-heading mb-0">
              <span className="eyebrow">Walk-in booking</span>
              <h2>Add confirmed visit</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-label">
                Customer name
                <input
                  className="form-field"
                  value={walkInForm.customerName}
                  onChange={(event) => updateWalkInField('customerName', event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                Phone
                <input
                  className="form-field"
                  value={walkInForm.phone}
                  onChange={(event) => updateWalkInField('phone', event.target.value)}
                  placeholder="10 digit mobile"
                  required
                />
              </label>
            </div>

            <label className="form-label">
              Email
              <input
                className="form-field"
                type="email"
                value={walkInForm.email}
                onChange={(event) => updateWalkInField('email', event.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="form-label">
                Service
                <select
                  className="form-field"
                  value={walkInForm.serviceId}
                  onChange={(event) => updateWalkInField('serviceId', event.target.value)}
                  required
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                Date
                <input
                  className="form-field"
                  min={today}
                  type="date"
                  value={walkInForm.date}
                  onChange={(event) => updateWalkInField('date', event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                Time
                <select
                  className="form-field"
                  value={walkInForm.time}
                  onChange={(event) => updateWalkInField('time', event.target.value)}
                  required
                >
                  {slotTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form-label">
              Notes
              <textarea
                className="form-field min-h-24 resize-y"
                value={walkInForm.notes}
                onChange={(event) => updateWalkInField('notes', event.target.value)}
              />
            </label>

            {slotTimes.length === 0 && <p className="empty-state">No available slots for the selected date.</p>}

            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={closeWalkInModal} disabled={Boolean(busyAction)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={busyAction === 'walkin' || slotTimes.length === 0}>
                {busyAction === 'walkin' && <ButtonLoader />}
                {busyAction === 'walkin' ? 'Adding walk-in' : 'Add walk-in'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default AdminPage
