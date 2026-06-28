const cron = require('node-cron')
const Appointment = require('../models/Appointment.model')
const NotificationService = require('../utils/NotificationService')

function toHHMM(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

cron.schedule('*/30 * * * *', async () => {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const from = new Date(now.getTime() + 55 * 60 * 1000)
  const to = new Date(now.getTime() + 65 * 60 * 1000)

  const appointments = await Appointment.find({
    status: 'confirmed',
    'slot.date': today,
    'slot.startTime': { $gte: toHHMM(from), $lte: toHHMM(to) },
    'reminders.oneHourSent': { $ne: true },
  })

  for (const appointment of appointments) {
    await NotificationService.oneHourReminder(appointment)
    appointment.reminders.oneHourSent = true
    await appointment.save()
  }
})
