import StatusBadge from './StatusBadge'

function BookingRow({ booking, serviceName, onSelect }) {
  return (
    <article className="grid items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <div>
        <strong className="block text-slate-950">{booking.id}</strong>
        <span className="block text-sm text-slate-500">
          {serviceName(booking.serviceId)} - {booking.date} at {booking.time}
        </span>
      </div>
      <StatusBadge status={booking.status} />
      <button className="btn-ghost" onClick={onSelect}>
        Open
      </button>
    </article>
  )
}

export default BookingRow
