const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
    },
    service: {
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      name: String,
      price: Number,
      duration: Number,
    },
    slot: {
      slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
      date: String,
      startTime: String,
      endTime: String,
    },
    status: {
      type: String,
      enum: ['pending', 'payment_pending', 'upi_claimed', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    token: {
      amount: Number,
      requestedAt: Date,
      paymentMethod: { type: String, enum: ['razorpay', 'upi', 'none'], default: 'none' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      upiConfirmedByAdmin: { type: Boolean, default: false },
      paidAt: Date,
    },
    reminders: {
      bookingDaySent: { type: Boolean, default: false },
      oneHourSent: { type: Boolean, default: false },
    },
    timeProposal: {
      date: String,
      startTime: String,
      note: String,
      customerConfirmed: { type: Boolean, default: false },
      proposedAt: Date,
      confirmedAt: Date,
    },
    bookingType: { type: String, enum: ['online', 'walkin'], default: 'online' },
    cancellationReason: String,
    notes: String,
  },
  { timestamps: true },
)

appointmentSchema.index({ status: 1 })
appointmentSchema.index({ 'slot.date': 1 })
appointmentSchema.index({ 'customer.phone': 1 })

module.exports = mongoose.model('Appointment', appointmentSchema)
