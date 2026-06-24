import AdminBooking from '../components/AdminBooking'
import Metric from '../components/Metric'

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
  confirmUpi,
  addWalkIn,
}) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pending" value={pendingBookings.length} />
        <Metric label="UPI claims" value={upiBookings.length} />
        <Metric label="Confirmed today" value={confirmedToday.length} />
        <Metric label="Total bookings" value={bookings.length} />
      </div>

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
                primaryLabel="Approve"
                onPrimary={() => approveBooking(booking.id)}
                secondaryLabel="Reject"
                onSecondary={() => rejectBooking(booking.id)}
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
              />
            ))}
            {upiBookings.length === 0 && <p className="empty-state">No UPI claims.</p>}
          </div>
          <button className="btn-secondary mt-4 w-full" onClick={addWalkIn}>
            Add walk-in booking
          </button>
        </div>
      </div>
    </section>
  )
}

export default AdminPage
