const asyncHandler = require('../utils/asyncHandler')
const Business = require('../models/Business.model')

const editableBusinessFields = [
  'businessName',
  'category',
  'address',
  'phone',
  'ownerEmail',
  'ownerPhone',
  'openTime',
  'closeTime',
  'slotDuration',
  'autoGenerateSlots',
  'bookingMode',
  'workingDays',
  'holidays',
  'tokenAmount',
  'upiId',
  'upiName',
]

exports.getBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findOne()
  res.json({ success: true, data: business })
})

exports.updateBusiness = asyncHandler(async (req, res) => {
  const patch = editableBusinessFields.reduce((nextPatch, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      nextPatch[field] = req.body[field]
    }
    return nextPatch
  }, {})

  let business = await Business.findOne()

  if (business) {
    business.set(patch)
    await business.save()
  } else {
    business = await Business.create(patch)
  }

  res.json({ success: true, data: business })
})
