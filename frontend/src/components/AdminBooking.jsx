import ButtonLoader from './ButtonLoader'

function AdminBooking({
  booking,
  serviceName,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
  primaryLoading,
  secondaryLoading,
  tertiaryLoading,
  primaryDisabled,
  disabled,
}) {
  const proposal = booking.timeProposal

  return (
    <article className="grid items-center gap-3 rounded-lg border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur sm:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <strong className="block text-lg font-black text-slate-950">{booking.customerName}</strong>
        <span className="block text-sm font-semibold text-slate-500">
          {serviceName(booking.serviceId)} - {booking.date} at {booking.time}
        </span>
        <small className="block text-sm font-semibold text-emerald-700">{booking.phone}</small>
        {proposal?.date && (
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${
              proposal.customerConfirmed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {proposal.customerConfirmed ? 'Suggested time accepted' : 'Waiting for customer time confirmation'}
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          className="btn-primary min-h-9 px-2.5 py-1.5"
          disabled={disabled || primaryLoading || primaryDisabled}
          onClick={onPrimary}
        >
          {primaryLoading && <ButtonLoader />}
          {primaryLoading ? 'Working' : primaryLabel}
        </button>
        <button className="btn-ghost" disabled={disabled || secondaryLoading} onClick={onSecondary}>
          {secondaryLoading && <ButtonLoader />}
          {secondaryLoading ? 'Working' : secondaryLabel}
        </button>
        {tertiaryLabel && (
          <button className="btn-ghost" disabled={disabled || tertiaryLoading} onClick={onTertiary}>
            {tertiaryLoading && <ButtonLoader />}
            {tertiaryLoading ? 'Working' : tertiaryLabel}
          </button>
        )}
      </div>
    </article>
  )
}

export default AdminBooking
