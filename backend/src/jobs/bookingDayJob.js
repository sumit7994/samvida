const cron = require('node-cron')
const Appointment = require('../models/Appointment.model')
const NotificationService = require('../utils/NotificationService')

cron.schedule('0 8 * * *', async () => {
  const today = new Date().toISOString().slice(0, 10)
  const appointments = await Appointment.find({
    status: 'confirmed',
    'slot.date': today,
    'reminders.bookingDaySent': { $ne: true },
  })

  for (const appointment of appointments) {
    await NotificationService.bookingDayReminder(appointment)
    appointment.reminders.bookingDaySent = true
    await appointment.save()
  }
})
