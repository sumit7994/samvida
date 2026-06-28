const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const Service = require('../models/Service.model')

exports.listServices = asyncHandler(async (req, res) => {
  const query = req.query.includeInactive === 'true' ? {} : { isActive: true }
  const services = await Service.find(query).sort({ createdAt: 1 })
  res.json({ success: true, data: services })
})

exports.createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body)
  res.status(201).json({ success: true, data: service })
})

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  })

  if (!service) throw new AppError('Service not found', 404)

  res.json({ success: true, data: service })
})

exports.deactivateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { returnDocument: 'after' },
  )

  if (!service) throw new AppError('Service not found', 404)

  res.json({ success: true, data: service })
})

exports.activateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { returnDocument: 'after' },
  )

  if (!service) throw new AppError('Service not found', 404)

  res.json({ success: true, data: service })
})
