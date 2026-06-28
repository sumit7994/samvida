import StatusBadge from './StatusBadge'
import { bookingRowClass } from '../utils/statusStyles'

function BookingRow({ booking, serviceName, onSelect }) {
  return (
    <article
      className={`grid items-center gap-3 rounded-lg border p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] ${bookingRowClass(
        booking.status,
      )}`}
    >
      <div>
        <strong className="block text-lg font-black text-slate-950">{booking.id}</strong>
        <span className="block text-sm font-semibold text-slate-500">
          {serviceName(booking.serviceId)} - {booking.date} at {booking.time}
        </span>
        {booking.cancellationReason && (
          <span className="mt-1 block text-sm font-bold text-rose-700">
            Reason: {booking.cancellationReason}
          </span>
        )}
      </div>
      <StatusBadge status={booking.status} />
      <button className="btn-ghost" onClick={onSelect}>
        View status
      </button>
    </article>
  )
}

export default BookingRow
