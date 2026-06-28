import { useMemo, useState } from 'react'
import AdminNav from '../components/AdminNav'
import ButtonLoader from '../components/ButtonLoader'
import StatusBadge from '../components/StatusBadge'
import { statusLabels } from '../data/constants'
import { bookingRowClass } from '../utils/statusStyles'

const pageSizes = [5, 10, 20]

function AdminBookingsPage({
  bookings,
  services,
  serviceName,
  cancelBooking,
  markCompleted,
  markNoShow,
  logoutAdmin,
  loading,
  busyAction,
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [serviceId, setServiceId] = useState('all')
  const [date, setDate] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const filteredBookings = useMemo(() => {
    const search = query.trim().toLowerCase()

    return bookings.filter((booking) => {
      const matchesSearch =
        !search ||
        [
          booking.id,
          booking.customerName,
          booking.phone,
          booking.email,
          booking.serviceName,
          booking.cancellationReason,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      const matchesStatus = status === 'all' || booking.status === status
      const matchesService = serviceId === 'all' || String(booking.serviceId) === serviceId
      const matchesDate = !date || booking.date === date

      return matchesSearch && matchesStatus && matchesService && matchesDate
    })
  }, [bookings, date, query, serviceId, status])

  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedBookings = filteredBookings.slice(pageStart, pageStart + pageSize)

  function resetPage(callback) {
    setPage(1)
    callback()
  }

  return (
    <section className="grid gap-5">
      <AdminNav logoutAdmin={logoutAdmin} />

      {loading && <p className="empty-state">Refreshing bookings...</p>}

      <div className="panel">
        <div className="section-heading">
          <span className="eyebrow">Booking history</span>
          <h2>All bookings</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_180px_160px_120px]">
          <label className="form-label">
            Search
            <input
              className="form-field"
              value={query}
              onChange={(event) => resetPage(() => setQuery(event.target.value))}
              placeholder="Name, phone, email, ID"
            />
          </label>

          <label className="form-label">
            Status
            <select
              className="form-field"
              value={status}
              onChange={(event) => resetPage(() => setStatus(event.target.value))}
            >
              <option value="all">All</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Service
            <select
              className="form-field"
              value={serviceId}
              onChange={(event) => resetPage(() => setServiceId(event.target.value))}
            >
              <option value="all">All services</option>
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
              type="date"
              value={date}
              onChange={(event) => resetPage(() => setDate(event.target.value))}
            />
          </label>

          <label className="form-label">
            Per page
            <select
              className="form-field"
              value={pageSize}
              onChange={(event) => resetPage(() => setPageSize(Number(event.target.value)))}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-500">
            Showing {paginatedBookings.length} of {filteredBookings.length} bookings
          </p>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              setQuery('')
              setStatus('all')
              setServiceId('all')
              setDate('')
              setPage(1)
            }}
          >
            Clear filters
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {paginatedBookings.map((booking) => (
            <article
              className={`grid gap-3 rounded-lg border p-4 shadow-sm xl:grid-cols-[minmax(0,1fr)_auto] ${bookingRowClass(
                booking.status,
              )}`}
              key={booking.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-lg font-black text-slate-950">{booking.id}</strong>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {booking.customerName} - {serviceName(booking.serviceId)} - {booking.date} at{' '}
                  {booking.time}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {booking.phone}
                  {booking.email ? ` - ${booking.email}` : ''}
                </p>
                {booking.cancellationReason && (
                  <p className="mt-1 text-sm font-bold text-rose-700">
                    Reason: {booking.cancellationReason}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <button
                  className="btn-ghost"
                  disabled={booking.status !== 'confirmed' || Boolean(busyAction)}
                  onClick={() => markCompleted(booking.id)}
                >
                  {busyAction === `complete:${booking.id}` && <ButtonLoader />}
                  {busyAction === `complete:${booking.id}` ? 'Completing' : 'Complete'}
                </button>
                <button
                  className="btn-ghost"
                  disabled={booking.status !== 'confirmed' || Boolean(busyAction)}
                  onClick={() => markNoShow(booking.id)}
                >
                  {busyAction === `no-show:${booking.id}` && <ButtonLoader />}
                  {busyAction === `no-show:${booking.id}` ? 'Saving' : 'No-show'}
                </button>
                <button
                  className="btn-ghost"
                  disabled={['cancelled', 'completed', 'no_show'].includes(booking.status) || Boolean(busyAction)}
                  onClick={() => cancelBooking(booking.id)}
                >
                  {busyAction === `cancel:${booking.id}` && <ButtonLoader />}
                  {busyAction === `cancel:${booking.id}` ? 'Cancelling' : 'Cancel'}
                </button>
              </div>
            </article>
          ))}
          {paginatedBookings.length === 0 && <p className="empty-state">No bookings match these filters.</p>}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {pageCount}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-ghost"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              className="btn-ghost"
              disabled={currentPage === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminBookingsPage
