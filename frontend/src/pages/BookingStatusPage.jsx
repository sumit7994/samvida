import { Link } from 'react-router-dom'
import BookingSummary from '../components/BookingSummary'

const statusCopy = {
  pending: {
    title: 'Request sent for admin review',
    body: 'The business owner will approve the slot and set a token amount before payment opens.',
  },
  payment_pending: {
    title: 'Approved, token payment required',
    body: 'Pay the token to lock this appointment slot.',
  },
  upi_claimed: {
    title: 'UPI payment claim submitted',
    body: 'The owner will verify the UPI payment manually and confirm the booking.',
  },
  confirmed: {
    title: 'Appointment confirmed',
    body: 'Your slot is locked. Please arrive a few minutes before the scheduled time.',
  },
  completed: {
    title: 'Appointment completed',
    body: 'The service has been marked as completed by the admin.',
  },
  cancelled: {
    title: 'Booking cancelled',
    body: 'This slot is no longer reserved. You can create a new booking request anytime.',
  },
  no_show: {
    title: 'Marked as no-show',
    body: 'The appointment was marked as missed by the admin.',
  },
}

function BookingStatusPage({
  booking,
  serviceName,
  onConfirmProposedTime,
  confirmingProposedTime,
  buttonLoader,
}) {
  if (!booking) {
    return (
      <section className="panel">
        <p className="empty-state">Booking not found.</p>
      </section>
    )
  }

  const copy = statusCopy[booking.status]
  const proposal = booking.timeProposal
  const hasPendingProposal = booking.status === 'pending' && proposal?.date && !proposal.customerConfirmed
  const hasAcceptedProposal = booking.status === 'pending' && proposal?.date && proposal.customerConfirmed

  function rememberTrackingContext() {
    localStorage.setItem('samvida_last_phone', booking.phone)
    localStorage.setItem('samvida_last_code', booking.id)
  }

  return (
    <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="panel">
        <div className="section-heading">
          <span className="eyebrow">Booking status</span>
          <h2>{copy.title}</h2>
        </div>
        <p className="mb-5 text-slate-600">{copy.body}</p>
        {hasPendingProposal && (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50/90 p-4">
            <span className="eyebrow">Action required</span>
            <h3 className="mt-1 text-xl font-black text-slate-950">New time suggested by admin</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Suggested time: <strong>{proposal.date} at {proposal.startTime}</strong>
            </p>
            {proposal.note && (
              <p className="mt-2 text-sm font-semibold text-rose-800">Note: {proposal.note}</p>
            )}
            <button
              className="btn-primary mt-4"
              type="button"
              disabled={confirmingProposedTime}
              onClick={onConfirmProposedTime}
            >
              {confirmingProposedTime && buttonLoader}
              {confirmingProposedTime ? 'Confirming' : 'Confirm this time'}
            </button>
          </div>
        )}
        {hasAcceptedProposal && (
          <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-bold text-emerald-800">
            You accepted the suggested time. Admin can now approve your booking.
          </p>
        )}
        <BookingSummary booking={booking} serviceName={serviceName} />
        <div className="mt-5 flex flex-wrap gap-2">
          {booking.status === 'payment_pending' && (
            <Link className="btn-primary" to={`/payment/${booking.id}`}>
              Continue to payment
            </Link>
          )}
          <Link className="btn-secondary" to="/track" onClick={rememberTrackingContext}>
            Track another booking
          </Link>
        </div>
      </div>

      <div className="panel">
        <span className="eyebrow">Reference ID</span>
        <strong className="mt-2 block text-4xl text-slate-950">{booking.id}</strong>
        <p className="mt-3 text-sm text-slate-500">
          Save this ID for payment support and admin follow-up.
        </p>
      </div>
    </section>
  )
}

export default BookingStatusPage
