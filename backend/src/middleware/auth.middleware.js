const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const User = require('../models/User.model')

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw new AppError('Admin login required', 401)
  }

  let payload

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new AppError('Invalid or expired admin token', 401)
  }
  const user = await User.findById(payload.id)

  if (!user) {
    throw new AppError('Admin account no longer exists', 401)
  }

  req.user = user
  next()
})

module.exports = protect
