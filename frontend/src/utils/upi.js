export function buildUpiPaymentUri({ upiId, payeeName, amount, bookingId }) {
  if (!upiId) return ''

  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName || 'Samvida',
    am: Number(amount || 0).toFixed(2),
    cu: 'INR',
    tn: `Booking token ${bookingId}`,
    tr: bookingId,
  })

  return `upi://pay?${params.toString()}`
}
