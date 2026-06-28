import { statusLabels } from '../data/constants'

const statusStyles = {
  pending: 'border-amber-200 bg-amber-100 text-amber-900',
  payment_pending: 'border-emerald-200 bg-emerald-100 text-emerald-900',
  upi_claimed: 'border-violet-200 bg-violet-100 text-violet-900',
  confirmed: 'border-emerald-200 bg-emerald-100 text-emerald-900',
  completed: 'border-emerald-200 bg-emerald-100 text-emerald-900',
  cancelled: 'border-rose-200 bg-rose-100 text-rose-900',
  no_show: 'border-red-200 bg-red-100 text-red-900',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-black ${
        statusStyles[status] || 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {statusLabels[status]}
    </span>
  )
}

export default StatusBadge
