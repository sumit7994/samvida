const mongoose = require('mongoose')

const slotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  },
  { timestamps: true },
)

slotSchema.index({ date: 1, startTime: 1 }, { unique: true })
slotSchema.index({ date: 1, isBooked: 1, isBlocked: 1 })

module.exports = mongoose.model('Slot', slotSchema)
