const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const Appointment = require('../models/Appointment.model')
const Business = require('../models/Business.model')
const Service = require('../models/Service.model')
const Slot = require('../models/Slot.model')
const NotificationService = require('../utils/NotificationService')
const generateUniqueBookingCode = require('../utils/bookingCode')

async function getAppointment(identifier) {
  const query = identifier?.toUpperCase().startsWith('SAM-')
    ? { bookingCode: identifier.toUpperCase() }
    : { _id: identifier }
  const appointment = await Appointment.findOne(query)
  if (!appointment) throw new AppError('Appointment not found', 404)
  return appointment
}

async function reserveSlot(slotId) {
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, isBooked: false, isBlocked: false },
    { isBooked: true },
    { returnDocument: 'after' },
  )

  if (!slot) throw new AppError('Slot is not available', 400)
  return slot
}

async function releaseSlot(appointment) {
  if (appointment.slot?.slotId) {
    await Slot.findOneAndUpdate(
      { _id: appointment.slot.slotId, appointmentId: appointment._id },
      { isBooked: false, appointmentId: null },
    )
  }
}

exports.createAppointment = asyncHandler(async (req, res) => {
  const { customer, serviceId, slotId, preferredDate, preferredTime, notes } = req.body
  const normalizedCustomer = {
    ...customer,
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    email: customer.email.toLowerCase().trim(),
  }
  const service = await Service.findById(serviceId)
  const business = await Business.findOne()
  const isFlexibleBooking = business?.bookingMode === 'flexible'

  if (!service || !service.isActive) throw new AppError('Service is not available', 400)
  if (!slotId && !isFlexibleBooking) throw new AppError('Slot is required', 400)
  if (isFlexibleBooking && (!preferredDate || !preferredTime)) {
    throw new AppError('Preferred date and time are required', 400)
  }

  const slot = slotId ? await reserveSlot(slotId) : null

  let appointment

  try {
    appointment = await Appointment.create({
      bookingCode: await generateUniqueBookingCode(Appointment),
      customer: normalizedCustomer,
      service: {
        serviceId: service._id,
        name: service.name,
        price: service.price,
        duration: service.duration,
      },
      slot: {
        slotId: slot?._id,
        date: slot?.date || preferredDate,
        startTime: slot?.startTime || preferredTime,
        endTime: slot?.endTime || '',
      },
      notes,
    })

    if (slot) {
      slot.appointmentId = appointment._id
      await slot.save()
    }
  } catch (error) {
    if (slot) await Slot.findByIdAndUpdate(slot._id, { isBooked: false, appointmentId: null })
    throw error
  }

  await NotificationService.bookingReceived(appointment)
  res.status(201).json({ success: true, data: appointment })
})

exports.trackByPhone = asyncHandler(async (req, res) => {
  const { code } = req.query
  const filter = { 'customer.phone': req.params.phone }

  if (code) {
    filter.bookingCode = code.toUpperCase()
  }

  const appointments = await Appointment.find(filter).sort({ createdAt: -1 })
  res.json({ success: true, data: appointments })
})

exports.getAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  res.json({ success: true, data: appointment })
})

exports.listAppointments = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.date) filter['slot.date'] = req.query.date

  const appointments = await Appointment.find(filter).sort({ createdAt: -1 })
  res.json({ success: true, data: appointments })
})

exports.approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (appointment.status !== 'pending') throw new AppError('Only pending bookings can be approved', 400)
  if (appointment.timeProposal?.date && !appointment.timeProposal.customerConfirmed) {
    throw new AppError('Customer must confirm the suggested time before approval', 400)
  }

  appointment.status = 'payment_pending'
  appointment.token.amount = Number(req.body.tokenAmount || 0)
  appointment.token.requestedAt = new Date()
  await appointment.save()

  const paymentLink = `${process.env.BOOKING_PAGE_URL || ''}/payment/${appointment.bookingCode}`
  await NotificationService.bookingApproved(appointment, paymentLink)

  res.json({ success: true, data: appointment })
})

exports.rejectAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (['cancelled', 'completed', 'no_show'].includes(appointment.status)) {
    throw new AppError('Terminal bookings cannot be rejected', 400)
  }

  const reason = req.body?.reason?.trim()
  appointment.status = 'cancelled'
  appointment.cancellationReason = reason || undefined
  await appointment.save()
  await releaseSlot(appointment)
  await NotificationService.bookingCancelled(appointment, appointment.cancellationReason)
  res.json({ success: true, data: appointment })
})

exports.proposeTime = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (appointment.status !== 'pending') throw new AppError('Only pending bookings can be modified', 400)

  const { date, time, note } = req.body
  if (!date || !time) throw new AppError('date and time are required', 400)

  await releaseSlot(appointment)
  appointment.slot = {
    date,
    startTime: time,
    endTime: '',
  }
  appointment.timeProposal = {
    date,
    startTime: time,
    note: note?.trim(),
    customerConfirmed: false,
    proposedAt: new Date(),
  }
  await appointment.save()
  await NotificationService.bookingTimeProposed(appointment, note)

  res.json({ success: true, data: appointment })
})

exports.confirmProposedTime = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (appointment.status !== 'pending') throw new AppError('Only pending bookings can confirm suggested time', 400)
  if (!appointment.timeProposal?.date) throw new AppError('No suggested time found for this booking', 400)

  appointment.timeProposal.customerConfirmed = true
  appointment.timeProposal.confirmedAt = new Date()
  await appointment.save()
  await NotificationService.bookingTimeAccepted(appointment)

  res.json({ success: true, data: appointment })
})

exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (['cancelled', 'completed', 'no_show'].includes(appointment.status)) {
    throw new AppError('Terminal bookings cannot be cancelled', 400)
  }

  appointment.status = 'cancelled'
  appointment.cancellationReason = req.body?.reason || 'Cancelled by admin'
  await appointment.save()
  await releaseSlot(appointment)
  await NotificationService.bookingCancelled(appointment, appointment.cancellationReason)
  res.json({ success: true, data: appointment })
})

exports.confirmUpi = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (appointment.status !== 'upi_claimed') throw new AppError('No UPI claim to confirm', 400)

  appointment.status = 'confirmed'
  appointment.token.upiConfirmedByAdmin = true
  appointment.token.paidAt = new Date()
  await appointment.save()
  await NotificationService.bookingConfirmed(appointment)

  res.json({ success: true, data: appointment })
})

exports.completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed bookings can be completed', 400)
  }

  appointment.status = 'completed'
  await appointment.save()
  await NotificationService.bookingCompleted(appointment)
  res.json({ success: true, data: appointment })
})

exports.noShowAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointment(req.params.id)
  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed bookings can be marked no-show', 400)
  }

  appointment.status = 'no_show'
  await appointment.save()
  await NotificationService.bookingNoShow(appointment)
  res.json({ success: true, data: appointment })
})

exports.createWalkIn = asyncHandler(async (req, res) => {
  const { customer, serviceId, slotId, notes } = req.body
  const service = await Service.findById(serviceId)

  if (!service || !service.isActive) throw new AppError('Service is not available', 400)
  const slot = await reserveSlot(slotId)

  let appointment

  try {
    appointment = await Appointment.create({
      bookingCode: await generateUniqueBookingCode(Appointment),
      customer,
      service: {
        serviceId: service._id,
        name: service.name,
        price: service.price,
        duration: service.duration,
      },
      slot: {
        slotId: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
      notes,
      status: 'confirmed',
      bookingType: 'walkin',
    })

    slot.appointmentId = appointment._id
    await slot.save()
  } catch (error) {
    await Slot.findByIdAndUpdate(slot._id, { isBooked: false, appointmentId: null })
    throw error
  }

  await NotificationService.walkInAdded(appointment)
  res.status(201).json({ success: true, data: appointment })
})
