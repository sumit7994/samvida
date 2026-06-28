import BookingRow from '../components/BookingRow'
import ButtonLoader from '../components/ButtonLoader'

function TrackPage({
  trackPhone,
  setTrackPhone,
  trackCode,
  setTrackCode,
  trackedBookings,
  serviceName,
  openBooking,
  onTrackSearch,
  loading,
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onTrackSearch(trackPhone, trackCode)
  }

  return (
    <section className="panel">
      <form className="grid gap-4 sm:flex sm:items-start sm:justify-between" onSubmit={handleSubmit}>
        <div className="section-heading">
          <span className="eyebrow">Customer tracking</span>
          <h2>Find bookings by phone</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-[220px_180px_auto]">
          <input
            className="form-field"
            value={trackPhone}
            onChange={(event) => setTrackPhone(event.target.value)}
            placeholder="Enter phone number"
          />
          <input
            className="form-field"
            value={trackCode}
            onChange={(event) => setTrackCode(event.target.value.toUpperCase())}
            placeholder="Booking ID"
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading && <ButtonLoader />}
            {loading ? 'Searching' : 'Search'}
          </button>
        </div>
      </form>

      <div className="mt-4 grid gap-3">
        {trackedBookings.map((booking) => (
          <BookingRow
            key={booking.id}
            booking={booking}
            serviceName={serviceName}
            onSelect={() => openBooking(booking.id)}
          />
        ))}
        {loading && <p className="empty-state">Searching bookings...</p>}
        {!loading && trackedBookings.length === 0 && <p className="empty-state">No bookings found.</p>}
      </div>
    </section>
  )
}

export default TrackPage
