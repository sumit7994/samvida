import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { initialBookings, services, slotTimes, today } from './data/mockData'
import AdminPage from './pages/AdminPage'
import BookingPage from './pages/BookingPage'
import PaymentPage from './pages/PaymentPage'
import TrackPage from './pages/TrackPage'

const pageTitles = {
  '/': 'Book an appointment',
  '/payment': 'Token payment',
  '/track': 'Track booking',
  '/admin': 'Admin dashboard',
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookings, setBookings] = useState(initialBookings)
  const [draft, setDraft] = useState({
    serviceId: services[0].id,
    date: today,
    time: slotTimes[1],
    customerName: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [trackPhone, setTrackPhone] = useState('9876543210')
  const [selectedBookingId, setSelectedBookingId] = useState('SAM-1025')
  const [tokenAmount, setTokenAmount] = useState(200)
  const [message, setMessage] = useState('Ready to accept real appointment requests.')

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) || bookings[0]
  const trackedBookings = bookings.filter((booking) => booking.phone.includes(trackPhone.trim()))
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending')
  const upiBookings = bookings.filter((booking) => booking.status === 'upi_claimed')
  const confirmedToday = bookings.filter(
    (booking) => booking.status === 'confirmed' && booking.date === today,
  )

  const unavailableSlots = useMemo(
    () =>
      bookings
        .filter((booking) => booking.date === draft.date && booking.status !== 'cancelled')
        .map((booking) => booking.time),
    [bookings, draft.date],
  )

  function serviceName(serviceId) {
    return services.find((service) => service.id === serviceId)?.name || 'Service'
  }

  function updateBooking(id, patch) {
    setBookings((current) =>
      current.map((booking) => (booking.id === id ? { ...booking, ...patch } : booking)),
    )
  }

  function submitBooking(event) {
    event.preventDefault()
    if (!draft.customerName.trim() || !draft.phone.trim()) {
      setMessage('Customer name and phone are required.')
      return
    }

    const newBooking = {
      id: `SAM-${Math.floor(1000 + Math.random() * 9000)}`,
      ...draft,
      status: 'pending',
      token: 0,
      paymentMethod: 'none',
    }

    setBookings((current) => [newBooking, ...current])
    setSelectedBookingId(newBooking.id)
    setMessage('Booking request received. Admin can now approve or reject it.')
    setDraft((current) => ({ ...current, customerName: '', phone: '', email: '', notes: '' }))
    navigate('/payment')
  }

  function approveBooking(id) {
    updateBooking(id, {
      status: 'payment_pending',
      token: Number(tokenAmount),
      paymentMethod: 'none',
    })
    setSelectedBookingId(id)
    setMessage('Approval sent. Customer can pay token through Razorpay or UPI.')
  }

  function rejectBooking(id) {
    updateBooking(id, { status: 'cancelled', notes: 'Rejected by admin' })
    setMessage('Booking rejected and slot released.')
  }

  function markPaid(method) {
    if (!selectedBooking) return
    updateBooking(selectedBooking.id, {
      status: method === 'upi' ? 'upi_claimed' : 'confirmed',
      paymentMethod: method,
    })
    setMessage(
      method === 'upi'
        ? 'UPI claim sent to admin for manual confirmation.'
        : 'Razorpay test payment verified and booking confirmed.',
    )
  }

  function confirmUpi(id) {
    updateBooking(id, { status: 'confirmed', paymentMethod: 'upi' })
    setMessage('UPI payment manually confirmed. Appointment is locked.')
  }

  function addWalkIn() {
    const walkIn = {
      id: `SAM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Walk-in Customer',
      phone: '9999900000',
      email: '',
      serviceId: 'consult',
      date: today,
      time: '18:30',
      status: 'confirmed',
      token: 0,
      paymentMethod: 'none',
      notes: 'Added from admin desk',
    }

    setBookings((current) => [walkIn, ...current])
    setMessage('Walk-in booking added as confirmed.')
  }

  function openPayment(id) {
    setSelectedBookingId(id)
    navigate('/payment')
  }

  return (
    <AppLayout headline={pageTitles[location.pathname] || 'Samvida'} message={message}>
      <Routes>
        <Route
          path="/"
          element={
            <BookingPage
              draft={draft}
              setDraft={setDraft}
              submitBooking={submitBooking}
              unavailableSlots={unavailableSlots}
            />
          }
        />
        <Route
          path="/payment"
          element={
            <PaymentPage
              selectedBooking={selectedBooking}
              tokenAmount={tokenAmount}
              serviceName={serviceName}
              markPaid={markPaid}
            />
          }
        />
        <Route
          path="/track"
          element={
            <TrackPage
              trackPhone={trackPhone}
              setTrackPhone={setTrackPhone}
              trackedBookings={trackedBookings}
              serviceName={serviceName}
              openPayment={openPayment}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              bookings={bookings}
              pendingBookings={pendingBookings}
              upiBookings={upiBookings}
              confirmedToday={confirmedToday}
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
              serviceName={serviceName}
              approveBooking={approveBooking}
              rejectBooking={rejectBooking}
              confirmUpi={confirmUpi}
              addWalkIn={addWalkIn}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
