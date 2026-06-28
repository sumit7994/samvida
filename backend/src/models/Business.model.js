const mongoose = require('mongoose')

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    category: {
      type: String,
      enum: ['salon', 'clinic', 'coaching', 'spa', 'gym', 'other'],
      default: 'salon',
    },
    address: String,
    phone: String,
    ownerEmail: String,
    ownerPhone: String,
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '20:00' },
    slotDuration: { type: Number, default: 30 },
    autoGenerateSlots: { type: Boolean, default: true },
    bookingMode: { type: String, enum: ['slot', 'flexible'], default: 'slot' },
    workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    holidays: { type: [String], default: [] },
    tokenAmount: { type: Number, default: 0 },
    upiId: { type: String, required: true },
    upiName: String,
  },
  { timestamps: true },
)

module.exports = mongoose.model('Business', businessSchema)
