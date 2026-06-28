require('dotenv').config()

const connectDB = require('../config/db')
const Business = require('../models/Business.model')
const Service = require('../models/Service.model')
const Slot = require('../models/Slot.model')
const User = require('../models/User.model')

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, mins + minutes)
  return date.toTimeString().slice(0, 5)
}

async function seed() {
  await connectDB()

  await Promise.all([
    Business.deleteMany({}),
    User.deleteMany({}),
    Service.deleteMany({}),
    Slot.deleteMany({}),
  ])

  await Business.create({
    businessName: 'Shivani Gautam Makeup Studio',
    category: 'salon',
    address: '1st Floor, Opposite to Post Office, Near SBI Bank, Khatauli, Muzaffarnagar, Uttar Pradesh 251201',
    phone: '+91 8954997994',
    ownerEmail: 'sumitpkumar6@gmail.com',
    ownerPhone: '8954997994',
    autoGenerateSlots: true,
    bookingMode: 'slot',
    upiId: 'owner@upi',
    upiName: 'Shivani Gautam Makeup Studio',
  })

  await User.create({
    name: 'Business Owner',
    email: 'sumitpkumar6@gmail.com',
    phone: '8954997994',
    password: 'password',
  })

  await Service.insertMany([
    { name: 'Haircut and Styling', category: 'Hair', duration: 45, price: 350 },
    { name: 'Express Facial', category: 'Skin', duration: 60, price: 900 },
    { name: 'Beard Grooming', category: 'Hair', duration: 30, price: 220 },
    { name: 'Consultation', category: 'Wellness', duration: 20, price: 150 },
  ])

  const today = new Date().toISOString().slice(0, 10)
  const times = ['09:30', '10:15', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30']

  await Slot.insertMany(
    times.map((time) => ({
      date: today,
      startTime: time,
      endTime: addMinutes(time, 30),
    })),
  )

  console.log('Seed complete. Admin: sumitpkumar6@gmail.com / password')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
