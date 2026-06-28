import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageLoader from '../components/PageLoader'
import PaymentPage from '../pages/PaymentPage'
import api from '../services/api'
import { normalizeBooking } from '../utils/normalizers'

function PaymentRoute({ tokenAmount, serviceName, markPaid, setMessage, busyAction, business }) {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBooking() {
      setLoading(true)
      try {
        const response = await api.get(`/appointments/pay/${bookingId}`)
        setBooking(normalizeBooking(response.data.data))
      } catch (error) {
        setMessage(error.response?.data?.message || 'Could not load payment booking.')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId, setMessage])

  async function handlePaid(id, method) {
    const paidBooking = await markPaid(id, method, booking)
    if (paidBooking) {
      setBooking(paidBooking)
    }
  }

  if (loading) return <PageLoader label="Loading payment" />

  return (
    <PaymentPage
      booking={booking}
      tokenAmount={tokenAmount}
      serviceName={serviceName}
      markPaid={handlePaid}
      busyAction={busyAction}
      business={business}
    />
  )
}

export default PaymentRoute
