import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { today } from '../data/constants'
import api from '../services/api'
import {
  normalizeBooking,
  normalizeBusiness,
  normalizeService,
  normalizeSlot,
} from '../utils/normalizers'
import { openRazorpayCheckout } from '../utils/razorpay'

export function useSamvidaApp() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [business, setBusiness] = useState(null)
  const [trackedBookings, setTrackedBookings] = useState([])
  const [services, setServices] = useState([])
  const [slots, setSlots] = useState([])
  const [slotDate, setSlotDate] = useState(today)
  const [draft, setDraft] = useState({
    serviceId: '',
    date: today,
    time: '',
    customerName: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [trackPhone, setTrackPhone] = useState(localStorage.getItem('samvida_last_phone') || '')
  const [trackCode, setTrackCode] = useState(localStorage.getItem('samvida_last_code') || '')
  const [tokenAmount, setTokenAmount] = useState(200)
  const [message, setMessage] = useState('Welcome to Samvida.')
  const [loading, setLoading] = useState({
    services: true,
    slots: false,
    adminBookings: false,
    tracking: false,
    bookingSubmit: false,
  })
  const [busyAction, setBusyAction] = useState('')
  const [confirmRequest, setConfirmRequest] = useState(null)

  const pendingBookings = bookings.filter((booking) => booking.status === 'pending')
  const upiBookings = bookings.filter((booking) => booking.status === 'upi_claimed')
  const confirmedToday = bookings.filter(
    (booking) => booking.status === 'confirmed' && booking.date === today,
  )
  const activeServices = services.filter((service) => service.isActive)
  const isFlexibleBooking = business?.bookingMode === 'flexible'
  const bookingSlots = slots.filter((slot) => slot.date === draft.date)
  const slotTimes = bookingSlots.map((slot) => slot.time)
  const blockedSlots = slots
    .filter((slot) => slot.isBlocked)
    .map((slot) => ({ date: slot.date, time: slot.time }))
  const unavailableSlots = bookingSlots
    .filter((slot) => slot.isBooked || slot.isBlocked)
    .map((slot) => slot.time)
  const availableSlotTimes = slots
    .filter((slot) => slot.date === slotDate && !slot.isBooked && !slot.isBlocked)
    .map((slot) => slot.time)
  const adminSlotTimes = slots.filter((slot) => slot.date === slotDate).map((slot) => slot.time)

  useEffect(() => {
    loadBusiness()
    loadServices()
  }, [])

  useEffect(() => {
    loadSlots(draft.date)
  }, [draft.date])

  useEffect(() => {
    loadSlots(slotDate)
  }, [slotDate])

  useEffect(() => {
    if (!draft.serviceId && activeServices[0]) {
      setDraft((current) => ({ ...current, serviceId: activeServices[0].id }))
    }
  }, [activeServices, draft.serviceId])

  useEffect(() => {
    if (!isFlexibleBooking && !draft.time && slotTimes[0]) {
      setDraft((current) => ({ ...current, time: slotTimes[0] }))
    }
  }, [draft.time, isFlexibleBooking, slotTimes])

  useEffect(() => {
    const token = localStorage.getItem('samvida_admin_token')
    if (token) {
      loadAdminBookings()
    }
  }, [])

  async function loadBusiness() {
    try {
      const response = await api.get('/business')
      const data = response.data.data
      if (data) {
        const nextBusiness = normalizeBusiness(data)
        setBusiness(nextBusiness)
        setTokenAmount(nextBusiness.tokenAmount || 200)
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load business profile.')
    }
  }

  function handleBusinessSaved(data) {
    const nextBusiness = normalizeBusiness(data)
    setBusiness(nextBusiness)
    setTokenAmount(nextBusiness.tokenAmount || 0)
  }

  async function loadServices(includeInactive = true) {
    setLoading((current) => ({ ...current, services: true }))
    try {
      const response = await api.get('/services', { params: { includeInactive } })
      setServices(response.data.data.map(normalizeService))
      setMessage('Services loaded.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load services.')
    } finally {
      setLoading((current) => ({ ...current, services: false }))
    }
  }

  async function loadSlots(date) {
    if (!date) return

    setLoading((current) => ({ ...current, slots: true }))
    try {
      const response = await api.get('/slots', { params: { date } })
      const nextSlots = response.data.data.map(normalizeSlot)
      setSlots((current) => [
        ...current.filter((slot) => slot.date !== date),
        ...nextSlots,
      ])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load slots.')
    } finally {
      setLoading((current) => ({ ...current, slots: false }))
    }
  }

  async function loadAdminBookings() {
    setLoading((current) => ({ ...current, adminBookings: true }))
    try {
      const response = await api.get('/appointments/all')
      setBookings(response.data.data.map(normalizeBooking))
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load admin bookings.')
    } finally {
      setLoading((current) => ({ ...current, adminBookings: false }))
    }
  }

  async function loadTrackedBookings(phone = trackPhone, code = trackCode) {
    if (!phone.trim()) {
      setTrackedBookings([])
      setMessage('Enter the phone number used for booking.')
      return
    }

    setLoading((current) => ({ ...current, tracking: true }))
    try {
      const response = await api.get(`/appointments/track/${phone.trim()}`, {
        params: code.trim() ? { code: code.trim() } : {},
      })
      setTrackedBookings(response.data.data.map(normalizeBooking))
      setMessage(response.data.data.length ? 'Bookings loaded.' : 'No bookings found for this phone.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not track bookings.')
    } finally {
      setLoading((current) => ({ ...current, tracking: false }))
    }
  }

  function serviceName(serviceId) {
    return (
      services.find((service) => service.id === serviceId)?.name ||
      bookings.find((booking) => booking.serviceId === serviceId)?.serviceName ||
      'Service'
    )
  }

  function confirmAction(options) {
    return new Promise((resolve) => {
      setConfirmRequest({ ...options, resolve })
    })
  }

  function resolveConfirm(result) {
    confirmRequest?.resolve(result)
    setConfirmRequest(null)
  }

  async function submitBooking(event) {
    event.preventDefault()
    if (!draft.customerName.trim() || !draft.phone.trim() || !draft.email.trim()) {
      setMessage('Customer name, phone, and email are required.')
      return
    }
    if (!activeServices.some((service) => service.id === draft.serviceId)) {
      setMessage('Please choose an active service.')
      return
    }
    if (!/^\d{10}$/.test(draft.phone.trim())) {
      setMessage('Enter a valid 10-digit mobile number.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      setMessage('Enter a valid email address.')
      return
    }
    if (draft.date < today) {
      setMessage('Please choose today or a future date.')
      return
    }
    if (!draft.time) {
      setMessage('Please choose a preferred time.')
      return
    }

    const selectedSlot = slots.find((slot) => slot.date === draft.date && slot.time === draft.time)
    if (!isFlexibleBooking && (!selectedSlot || selectedSlot.isBooked || selectedSlot.isBlocked)) {
      setMessage('That slot is not available. Please choose another time.')
      return
    }
    if (
      !(await confirmAction({
        title: 'Request this booking?',
        body: `${draft.customerName} - ${serviceName(draft.serviceId)} on ${draft.date} at ${draft.time}`,
        confirmLabel: 'Request booking',
      }))
    ) {
      return
    }

    setLoading((current) => ({ ...current, bookingSubmit: true }))
    try {
      const response = await api.post('/appointments', {
        customer: {
          name: draft.customerName,
          phone: draft.phone,
          email: draft.email,
        },
        serviceId: draft.serviceId,
        slotId: selectedSlot?.id,
        preferredDate: draft.date,
        preferredTime: draft.time,
        notes: draft.notes,
      })
      const booking = normalizeBooking(response.data.data)
      localStorage.setItem('samvida_last_phone', draft.phone)
      localStorage.setItem('samvida_last_code', booking.id)
      setTrackPhone(draft.phone)
      setTrackCode(booking.id)
      setBookings((current) => [booking, ...current])
      setTrackedBookings((current) => [booking, ...current])
      setMessage('Booking request received. Admin can now approve or reject it.')
      setDraft((current) => ({ ...current, customerName: '', phone: '', email: '', notes: '' }))
      await loadSlots(draft.date)
      navigate(`/booking/${booking.id}`)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create booking.')
    } finally {
      setLoading((current) => ({ ...current, bookingSubmit: false }))
    }
  }

  async function approveBooking(id) {
    if (Number(tokenAmount) < 0) {
      setMessage('Token amount cannot be negative.')
      return
    }
    if (
      !(await confirmAction({
        title: 'Approve booking?',
        body: `Customer will receive a token payment link for Rs.${tokenAmount}.`,
        confirmLabel: 'Approve',
      }))
    ) {
      return
    }

    setBusyAction(`approve:${id}`)
    try {
      await api.post(`/appointments/${id}/approve`, { tokenAmount: Number(tokenAmount) })
      setMessage('Approval sent. Customer can pay token through Razorpay or UPI.')
      await loadAdminBookings()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not approve booking.')
    } finally {
      setBusyAction('')
    }
  }

  async function rejectBooking(id, reason = '') {
    if (
      !(await confirmAction({
        title: 'Reject booking?',
        body: reason ? `Reason: ${reason}` : 'The slot will be released and the customer will be notified.',
        confirmLabel: 'Reject',
      }))
    ) {
      return
    }
    setBusyAction(`reject:${id}`)
    try {
      await api.post(`/appointments/${id}/reject`, { reason: reason.trim() })
      setMessage('Booking rejected and slot released.')
      await loadAdminBookings()
      await loadSlots(slotDate)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not reject booking.')
    } finally {
      setBusyAction('')
    }
  }

  async function proposeBookingTime(id, proposal) {
    if (!proposal.date || !proposal.time) {
      setMessage('Choose a date and time to suggest.')
      return false
    }
    if (
      !(await confirmAction({
        title: 'Suggest this time?',
        body: `${proposal.date} at ${proposal.time}`,
        confirmLabel: 'Send suggestion',
      }))
    ) {
      return false
    }

    setBusyAction(`propose:${id}`)
    try {
      await api.post(`/appointments/${id}/propose-time`, proposal)
      setMessage('Suggested time sent to customer.')
      await loadAdminBookings()
      return true
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not suggest time.')
      return false
    } finally {
      setBusyAction('')
    }
  }

  async function cancelBooking(id) {
    if (
      !(await confirmAction({
        title: 'Cancel booking?',
        body: 'The slot will be released and the customer will be notified.',
        confirmLabel: 'Cancel booking',
      }))
    ) {
      return
    }
    setBusyAction(`cancel:${id}`)
    try {
      await api.post(`/appointments/${id}/cancel`)
      setMessage('Booking cancelled and slot released.')
      await loadAdminBookings()
      await loadSlots(slotDate)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not cancel booking.')
    } finally {
      setBusyAction('')
    }
  }

  async function markCompleted(id) {
    if (
      !(await confirmAction({
        title: 'Mark completed?',
        body: 'The customer will receive a completion email.',
        confirmLabel: 'Complete',
      }))
    ) {
      return
    }
    setBusyAction(`complete:${id}`)
    try {
      await api.post(`/appointments/${id}/complete`)
      setMessage('Booking marked as completed.')
      await loadAdminBookings()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not complete booking.')
    } finally {
      setBusyAction('')
    }
  }

  async function markNoShow(id) {
    if (
      !(await confirmAction({
        title: 'Mark no-show?',
        body: 'The customer will receive a no-show email.',
        confirmLabel: 'Mark no-show',
      }))
    ) {
      return
    }
    setBusyAction(`no-show:${id}`)
    try {
      await api.post(`/appointments/${id}/no-show`)
      setMessage('Booking marked as no-show.')
      await loadAdminBookings()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not mark no-show.')
    } finally {
      setBusyAction('')
    }
  }

  async function markPaid(id, method, checkoutBooking) {
    if (
      !(await confirmAction({
        title: method === 'upi' ? 'Notify UPI payment?' : 'Start Razorpay payment?',
        body:
          method === 'upi'
            ? 'The owner will be asked to manually verify this payment.'
            : 'Razorpay checkout will open after this confirmation.',
        confirmLabel: method === 'upi' ? 'Notify owner' : 'Continue',
      }))
    ) {
      return null
    }
    setBusyAction(`pay:${method}:${id}`)
    try {
      let response
      if (method === 'upi') {
        response = await api.post(`/payment/upi-notify/${id}`)
        setMessage('UPI claim sent to admin for manual confirmation.')
      } else {
        const order = await api.post(`/payment/create-order/${id}`)
        const booking = checkoutBooking || bookings.find((item) => item.id === id) || { id }
        setMessage('Razorpay order created. Complete the payment in the secure popup.')
        const payment = await openRazorpayCheckout({
          order: order.data.data,
          booking,
          business,
        })
        setMessage('Payment received. Verifying with Razorpay...')
        response = await api.post(`/payment/verify/${id}`, {
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
        })
        setMessage('Razorpay payment verified and booking confirmed.')
      }

      const booking = normalizeBooking(response.data.data)
      setBookings((current) => [booking, ...current.filter((item) => item.id !== booking.id)])
      return booking
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Could not update payment.')
      return null
    } finally {
      setBusyAction('')
    }
  }

  async function confirmUpi(id) {
    if (
      !(await confirmAction({
        title: 'Confirm UPI payment?',
        body: 'This will mark the booking as confirmed.',
        confirmLabel: 'Confirm UPI',
      }))
    ) {
      return
    }
    setBusyAction(`confirm-upi:${id}`)
    try {
      await api.post(`/appointments/${id}/confirm-upi`)
      setMessage('UPI payment manually confirmed. Appointment is locked.')
      await loadAdminBookings()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not confirm UPI.')
    } finally {
      setBusyAction('')
    }
  }

  async function addWalkIn(walkIn) {
    const service = activeServices.find((item) => item.id === walkIn.serviceId)
    const slot = slots.find(
      (item) =>
        item.date === walkIn.date &&
        item.time === walkIn.time &&
        !item.isBooked &&
        !item.isBlocked,
    )

    if (!service || !slot) {
      setMessage('Choose an active service and available slot for the walk-in.')
      return false
    }
    if (!walkIn.customerName.trim() || !/^\d{10}$/.test(walkIn.phone.trim())) {
      setMessage('Walk-in customer name and valid 10-digit phone are required.')
      return false
    }
    if (walkIn.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(walkIn.email.trim())) {
      setMessage('Enter a valid walk-in email address or leave it blank.')
      return false
    }
    if (
      !(await confirmAction({
        title: 'Add walk-in booking?',
        body: `${walkIn.customerName} - ${service.name} on ${walkIn.date} at ${walkIn.time}`,
        confirmLabel: 'Add walk-in',
      }))
    ) {
      return false
    }

    setBusyAction('walkin')
    try {
      await api.post('/appointments/walkin', {
        customer: {
          name: walkIn.customerName.trim(),
          phone: walkIn.phone.trim(),
          email: walkIn.email.trim(),
        },
        serviceId: service.id,
        slotId: slot.id,
        notes: walkIn.notes.trim() || 'Added from admin desk',
      })
      setMessage('Walk-in booking added as confirmed.')
      await loadAdminBookings()
      await loadSlots(walkIn.date)
      return true
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add walk-in.')
      return false
    } finally {
      setBusyAction('')
    }
  }

  function openBooking(id) {
    navigate(`/booking/${id}`)
  }

  async function addService(service) {
    if (!service.name.trim()) {
      setMessage('Service name is required.')
      return
    }
    if (
      !(await confirmAction({
        title: 'Add service?',
        body: service.name.trim(),
        confirmLabel: 'Add service',
      }))
    ) {
      return
    }

    setBusyAction('add-service')
    try {
      await api.post('/services', {
        name: service.name.trim(),
        category: service.category.trim() || 'General',
        duration: Number(service.duration),
        price: Number(service.price),
      })
      setMessage('Service added to catalogue.')
      await loadServices()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add service.')
    } finally {
      setBusyAction('')
    }
  }

  async function updateService(id, patch) {
    if (
      !(await confirmAction({
        title: 'Save service changes?',
        body: 'This will update the service catalogue.',
        confirmLabel: 'Save changes',
      }))
    ) {
      return
    }
    setBusyAction(`service:${id}`)
    try {
      await api.put(`/services/${id}`, patch)
      await loadServices()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update service.')
    } finally {
      setBusyAction('')
    }
  }

  async function toggleService(id) {
    const service = services.find((item) => item.id === id)
    if (!service) return
    if (
      !(await confirmAction({
        title: `${service.isActive ? 'Deactivate' : 'Activate'} service?`,
        body: service.name,
        confirmLabel: service.isActive ? 'Deactivate' : 'Activate',
      }))
    ) {
      return
    }

    setBusyAction(`toggle-service:${id}`)
    try {
      await api.put(`/services/${id}/${service.isActive ? 'deactivate' : 'activate'}`)
      setMessage('Service availability updated.')
      await loadServices()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update service availability.')
    } finally {
      setBusyAction('')
    }
  }

  async function addSlotTime(time) {
    if (!time) {
      setMessage('Choose a slot time first.')
      return
    }
    if (
      !(await confirmAction({
        title: 'Add slot time?',
        body: `${slotDate} at ${time}`,
        confirmLabel: 'Add slot',
      }))
    ) {
      return
    }

    setBusyAction('add-slot')
    try {
      await api.post('/slots/generate', {
        date: slotDate,
        times: [time],
        duration: Number(business?.slotDuration || 30),
      })
      setMessage('Slot time added.')
      await loadSlots(slotDate)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add slot.')
    } finally {
      setBusyAction('')
    }
  }

  async function removeSlotTime(time) {
    const slot = slots.find((item) => item.date === slotDate && item.time === time)
    if (!slot) return
    if (
      !(await confirmAction({
        title: 'Remove slot time?',
        body: `${slotDate} at ${time}`,
        confirmLabel: 'Remove',
      }))
    ) {
      return
    }

    setBusyAction(`remove-slot:${time}`)
    try {
      await api.delete(`/slots/${slot.id}`)
      setMessage('Slot time removed from the grid.')
      await loadSlots(slotDate)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not remove slot.')
    } finally {
      setBusyAction('')
    }
  }

  async function toggleBlockedSlot(date, time) {
    const slot = slots.find((item) => item.date === date && item.time === time)
    if (!slot) return
    if (
      !(await confirmAction({
        title: slot.isBlocked ? 'Unblock slot?' : 'Block slot?',
        body: `${date} at ${time}`,
        confirmLabel: slot.isBlocked ? 'Unblock' : 'Block',
      }))
    ) {
      return
    }

    setBusyAction(`toggle-slot:${time}`)
    try {
      await api.put(`/slots/${slot.id}/${slot.isBlocked ? 'unblock' : 'block'}`)
      setMessage(slot.isBlocked ? 'Slot unblocked for public booking.' : 'Slot blocked for public booking.')
      await loadSlots(date)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update slot.')
    } finally {
      setBusyAction('')
    }
  }

  function logoutAdmin() {
    localStorage.removeItem('samvida_admin_token')
    setBookings([])
    setMessage('Admin logged out.')
    navigate('/admin/login')
  }

  return {
    activeServices,
    addService,
    addSlotTime,
    addWalkIn,
    adminSlotTimes,
    approveBooking,
    availableSlotTimes,
    blockedSlots,
    bookings,
    business,
    busyAction,
    cancelBooking,
    confirmAction,
    confirmRequest,
    confirmUpi,
    confirmedToday,
    draft,
    handleBusinessSaved,
    loadAdminBookings,
    loadTrackedBookings,
    loading,
    logoutAdmin,
    markCompleted,
    markNoShow,
    markPaid,
    message,
    openBooking,
    pendingBookings,
    proposeBookingTime,
    rejectBooking,
    removeSlotTime,
    resolveConfirm,
    serviceName,
    services,
    setBusyAction,
    setDraft,
    setMessage,
    setSlotDate,
    setTokenAmount,
    setTrackCode,
    setTrackPhone,
    slotDate,
    slotTimes,
    submitBooking,
    toggleBlockedSlot,
    toggleService,
    tokenAmount,
    trackCode,
    trackedBookings,
    trackPhone,
    unavailableSlots,
    updateService,
    upiBookings,
  }
}
