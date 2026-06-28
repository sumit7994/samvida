export const today = new Date().toISOString().slice(0, 10)

export const statusLabels = {
  pending: 'Pending review',
  payment_pending: 'Payment pending',
  upi_claimed: 'UPI claimed',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
}
