import StatusBadge from './StatusBadge'

function DetailItem({ label, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200/80 pb-3">
      <dt className="text-sm font-bold text-slate-500">{label}</dt>
      <dd className="m-0 text-right font-black text-slate-950">{children}</dd>
    </div>
  )
}

function BookingSummary({ booking, serviceName }) {
  return (
    <dl className="grid gap-3">
      <DetailItem label="Customer">{booking.customerName}</DetailItem>
      <DetailItem label="Service">{serviceName(booking.serviceId)}</DetailItem>
      <DetailItem label="Slot">
        {booking.date} at {booking.time}
      </DetailItem>
      <DetailItem label="Status">
        <StatusBadge status={booking.status} />
      </DetailItem>
      {booking.cancellationReason && (
        <DetailItem label="Reason">{booking.cancellationReason}</DetailItem>
      )}
      <DetailItem label="Token">{booking.token ? `Rs.${booking.token}` : 'Not requested yet'}</DetailItem>
    </dl>
  )
}

export default BookingSummary
