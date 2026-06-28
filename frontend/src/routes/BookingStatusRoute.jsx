import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ButtonLoader from '../components/ButtonLoader'
import PageLoader from '../components/PageLoader'
import BookingStatusPage from '../pages/BookingStatusPage'
import api from '../services/api'
import { normalizeBooking } from '../utils/normalizers'

function BookingStatusRoute({ serviceName, setMessage }) {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function loadBooking() {
      setLoading(true)
      try {
        const response = await api.get(`/appointments/pay/${bookingId}`)
        setBooking(normalizeBooking(response.data.data))
      } catch (error) {
        setMessage(error.response?.data?.message || 'Could not load booking.')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId, setMessage])

  async function confirmProposedTime() {
    setConfirming(true)
    try {
      const response = await api.post(`/appointments/${bookingId}/confirm-proposed-time`)
      setBooking(normalizeBooking(response.data.data))
      setMessage('Suggested time confirmed. Admin can now approve your booking.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not confirm suggested time.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <PageLoader label="Loading booking" />

  return (
    <BookingStatusPage
      booking={booking}
      serviceName={serviceName}
      onConfirmProposedTime={confirmProposedTime}
      confirmingProposedTime={confirming}
      buttonLoader={<ButtonLoader />}
    />
  )
}

export default BookingStatusRoute
