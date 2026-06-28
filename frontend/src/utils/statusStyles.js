export const statusRowStyles = {
  pending: 'border-amber-200 bg-amber-50/90',
  payment_pending: 'border-emerald-200 bg-emerald-50/90',
  upi_claimed: 'border-violet-200 bg-violet-50/90',
  confirmed: 'border-emerald-200 bg-emerald-50/90',
  completed: 'border-emerald-200 bg-emerald-50/90',
  cancelled: 'border-rose-200 bg-rose-50/90',
  no_show: 'border-red-200 bg-red-50/90',
}

export function bookingRowClass(status) {
  return statusRowStyles[status] || 'border-slate-200 bg-white/80'
}
