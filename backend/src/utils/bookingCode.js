function generateBookingCode() {
  return `SAM-${Math.floor(100000 + Math.random() * 900000)}`
}

async function generateUniqueBookingCode(Appointment) {
  let bookingCode
  let exists = true

  while (exists) {
    bookingCode = generateBookingCode()
    exists = await Appointment.exists({ bookingCode })
  }

  return bookingCode
}

module.exports = generateUniqueBookingCode
