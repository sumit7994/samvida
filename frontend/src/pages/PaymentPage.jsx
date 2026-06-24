import { business } from '../data/mockData'
import BookingSummary from '../components/BookingSummary'

function PaymentPage({ selectedBooking, tokenAmount, serviceName, markPaid }) {
  if (!selectedBooking) {
    return <p className="empty-state">No booking selected.</p>
  }

  return (
    <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="panel">
        <div className="section-heading">
          <span className="eyebrow">Payment page</span>
          <h2>{selectedBooking.id}</h2>
        </div>
        <BookingSummary booking={selectedBooking} serviceName={serviceName} />
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="btn-primary"
            disabled={selectedBooking.status !== 'payment_pending'}
            onClick={() => markPaid('razorpay')}
          >
            Pay Razorpay token
          </button>
          <button
            className="btn-secondary"
            disabled={selectedBooking.status !== 'payment_pending'}
            onClick={() => markPaid('upi')}
          >
            I paid by UPI
          </button>
        </div>
      </div>

      <div className="panel grid justify-items-center gap-3 text-center">
        <div className="grid h-52 w-52 place-items-center rounded-lg border-[10px] border-white bg-[linear-gradient(90deg,#111_10px,transparent_10px),linear-gradient(#111_10px,transparent_10px)] bg-[length:35px_35px] bg-slate-100 outline outline-1 outline-slate-200">
          <span className="max-w-36 rounded-md bg-white p-2 text-sm font-extrabold text-slate-950">
            {business.upiId}
          </span>
        </div>
        <p>UPI QR placeholder for Rs.{selectedBooking.token || tokenAmount}</p>
        <p className="text-sm text-slate-500">
          Backend will replace this with qrcode.react and real payment links.
        </p>
      </div>
    </section>
  )
}

export default PaymentPage
