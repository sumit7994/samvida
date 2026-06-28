import { QRCodeSVG } from 'qrcode.react'
import BookingSummary from '../components/BookingSummary'
import ButtonLoader from '../components/ButtonLoader'
import { buildUpiPaymentUri } from '../utils/upi'

function PaymentPage({ booking, tokenAmount, serviceName, markPaid, busyAction, business }) {
  if (!booking) {
    return <p className="empty-state">No booking selected.</p>
  }

  const canPay = booking.status === 'payment_pending'
  const upiAmount = booking.token || tokenAmount
  const upiUri = buildUpiPaymentUri({
    upiId: business?.upiId,
    payeeName: business?.name,
    amount: upiAmount,
    bookingId: booking.id,
  })
  const hasUpiQr = Boolean(upiUri)

  return (
    <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="panel">
        <div className="section-heading">
          <span className="eyebrow">Payment page</span>
          <h2>{booking.id}</h2>
        </div>
        <BookingSummary booking={booking} serviceName={serviceName} />
        {!canPay && (
          <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">
            Payment opens only after admin approval.
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="btn-primary"
            disabled={!canPay || Boolean(busyAction)}
            onClick={() => markPaid(booking.id, 'razorpay')}
          >
            {busyAction === `pay:razorpay:${booking.id}` && <ButtonLoader />}
            {busyAction === `pay:razorpay:${booking.id}` ? 'Processing' : 'Pay Razorpay token'}
          </button>
          <button
            className="btn-secondary"
            disabled={!canPay || !hasUpiQr || Boolean(busyAction)}
            onClick={() => markPaid(booking.id, 'upi')}
          >
            {busyAction === `pay:upi:${booking.id}` && <ButtonLoader />}
            {busyAction === `pay:upi:${booking.id}` ? 'Notifying' : 'I paid by UPI'}
          </button>
        </div>
      </div>

      <div className="panel grid justify-items-center gap-3 text-center">
        {hasUpiQr ? (
          <>
            <div className="rounded-lg border border-zinc-900/10 bg-white p-4 shadow-[0_20px_60px_rgba(24,24,27,0.12)]">
              <QRCodeSVG
                value={upiUri}
                size={220}
                marginSize={2}
                level="M"
                title={`UPI payment for ${booking.id}`}
              />
            </div>
            <p className="text-2xl font-black text-slate-950">UPI payment for Rs.{upiAmount}</p>
            <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-800">{business.upiId}</p>
            <a className="btn-secondary w-full" href={upiUri}>
              Open UPI app
            </a>
            <p className="text-sm font-semibold text-slate-500">Scan or open the link, pay the token, then notify the owner.</p>
          </>
        ) : (
          <>
            <div className="grid h-56 w-56 place-items-center rounded-lg border border-dashed border-slate-300 bg-white/70 p-5 text-sm font-bold text-slate-500">
              UPI ID not configured
            </div>
            <p className="text-sm text-slate-500">Add a UPI ID in the business profile to enable QR payments.</p>
          </>
        )}
      </div>
    </section>
  )
}

export default PaymentPage
