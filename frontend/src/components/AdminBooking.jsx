function AdminBooking({
  booking,
  serviceName,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <article className="grid items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <strong className="block text-slate-950">{booking.customerName}</strong>
        <span className="block text-sm text-slate-500">
          {serviceName(booking.serviceId)} - {booking.date} at {booking.time}
        </span>
        <small className="block text-sm text-slate-500">{booking.phone}</small>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button className="btn-primary min-h-9 px-2.5 py-1.5" onClick={onPrimary}>
          {primaryLabel}
        </button>
        <button className="btn-ghost" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      </div>
    </article>
  )
}

export default AdminBooking
