import { statusLabels } from '../data/mockData'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  payment_pending: 'bg-sky-100 text-sky-800',
  upi_claimed: 'bg-sky-100 text-sky-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-red-100 text-red-800',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-black ${
        statusStyles[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {statusLabels[status]}
    </span>
  )
}

export default StatusBadge
