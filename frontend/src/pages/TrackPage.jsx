import BookingRow from '../components/BookingRow'

function TrackPage({ trackPhone, setTrackPhone, trackedBookings, serviceName, openPayment }) {
  return (
    <section className="panel">
      <div className="grid gap-4 sm:flex sm:items-start sm:justify-between">
        <div className="section-heading">
          <span className="eyebrow">Customer tracking</span>
          <h2>Find bookings by phone</h2>
        </div>
        <input
          className="form-field sm:max-w-xs"
          value={trackPhone}
          onChange={(event) => setTrackPhone(event.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <div className="mt-4 grid gap-3">
        {trackedBookings.map((booking) => (
          <BookingRow
            key={booking.id}
            booking={booking}
            serviceName={serviceName}
            onSelect={() => openPayment(booking.id)}
          />
        ))}
        {trackedBookings.length === 0 && <p className="empty-state">No bookings found.</p>}
      </div>
    </section>
  )
}

export default TrackPage
