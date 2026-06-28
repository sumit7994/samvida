const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const Business = require('../models/Business.model')
const Slot = require('../models/Slot.model')

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, mins + minutes)
  return date.toTimeString().slice(0, 5)
}

function toMinutes(time) {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const mins = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${mins}`
}

function getDayName(date) {
  return dayNames[new Date(`${date}T00:00:00`).getDay()]
}

function isBookableBusinessDate(business, date) {
  if (!business) return true
  if (business.holidays?.includes(date)) return false
  const workingDays = business.workingDays?.length ? business.workingDays : dayNames
  return workingDays.includes(getDayName(date))
}

function buildBusinessSlotTimes(business) {
  const duration = Number(business?.slotDuration || 30)
  if (!duration || duration < 5) return []

  const start = toMinutes(business?.openTime || '09:00')
  const close = toMinutes(business?.closeTime || '20:00')
  if (!Number.isFinite(start) || !Number.isFinite(close) || close <= start) return []

  const times = []
  for (let current = start; current + duration <= close; current += duration) {
    times.push(minutesToTime(current))
  }
  return times
}

async function autoGenerateBusinessSlots(date, business) {
  if (!business?.autoGenerateSlots || !isBookableBusinessDate(business, date)) return

  const duration = Number(business.slotDuration || 30)
  const times = buildBusinessSlotTimes(business)
  const operations = times.map((time) => ({
    updateOne: {
      filter: { date, startTime: time },
      update: {
        $setOnInsert: {
          date,
          startTime: time,
          endTime: addMinutes(time, duration),
        },
      },
      upsert: true,
    },
  }))

  if (operations.length) {
    await Slot.bulkWrite(operations)
  }
}

exports.listSlots = asyncHandler(async (req, res) => {
  const { date } = req.query
  if (!date) throw new AppError('date query is required', 400)

  const business = await Business.findOne()
  if (business?.autoGenerateSlots && !isBookableBusinessDate(business, date)) {
    res.json({ success: true, data: [] })
    return
  }

  await autoGenerateBusinessSlots(date, business)

  const slots = await Slot.find({ date }).sort({ startTime: 1 })
  res.json({ success: true, data: slots })
})

exports.generateSlots = asyncHandler(async (req, res) => {
  const { date, times = [], duration = 30 } = req.body
  if (!date || !Array.isArray(times)) {
    throw new AppError('date and times[] are required', 400)
  }

  const business = await Business.findOne()
  if (!isBookableBusinessDate(business, date)) {
    throw new AppError('Slots cannot be generated for a holiday or off day', 400)
  }

  const operations = times.map((time) => ({
    updateOne: {
      filter: { date, startTime: time },
      update: {
        $setOnInsert: {
          date,
          startTime: time,
          endTime: addMinutes(time, duration),
        },
      },
      upsert: true,
    },
  }))

  if (operations.length) {
    await Slot.bulkWrite(operations)
  }

  const slots = await Slot.find({ date }).sort({ startTime: 1 })
  res.status(201).json({ success: true, data: slots })
})

async function setBlocked(req, res, isBlocked) {
  const slot = await Slot.findById(req.params.id)
  if (!slot) throw new AppError('Slot not found', 404)

  if (isBlocked && slot.isBooked) {
    throw new AppError('Booked slots cannot be blocked', 400)
  }

  slot.isBlocked = isBlocked
  await slot.save()

  res.json({ success: true, data: slot })
}

exports.blockSlot = asyncHandler((req, res) => setBlocked(req, res, true))
exports.unblockSlot = asyncHandler((req, res) => setBlocked(req, res, false))

exports.deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id)
  if (!slot) throw new AppError('Slot not found', 404)
  if (slot.isBooked) throw new AppError('Booked slots cannot be removed', 400)

  await slot.deleteOne()
  res.json({ success: true, data: slot })
})
