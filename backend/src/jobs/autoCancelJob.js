const cron = require('node-cron')
const Appointment = require('../models/Appointment.model')
const Slot = require('../models/Slot.model')
const NotificationService = require('../utils/NotificationService')

cron.schedule('*/15 * * * *', async () => {
  const expiryHours = Number(process.env.TOKEN_EXPIRY_HOURS || 2)
  const cutoff = new Date(Date.now() - expiryHours * 60 * 60 * 1000)

  const expired = await Appointment.find({
    status: 'payment_pending',
    'token.requestedAt': { $lt: cutoff },
  })

  for (const appointment of expired) {
    appointment.status = 'cancelled'
    appointment.cancellationReason = 'Token payment was not completed within the time limit.'
    await appointment.save()
    await Slot.findOneAndUpdate(
      { _id: appointment.slot.slotId, appointmentId: appointment._id },
      { isBooked: false, appointmentId: null },
    )
    await NotificationService.bookingCancelled(appointment, appointment.cancellationReason)
  }
})
