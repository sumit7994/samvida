const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const User = require('../models/User.model')

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401)
  }

  const token = signToken(user)

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

exports.me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  })
})

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  req.user.name = name?.trim() || req.user.name
  req.user.email = email?.toLowerCase().trim() || req.user.email
  req.user.phone = phone?.trim() || req.user.phone

  if (password) {
    req.user.password = password
  }

  await req.user.save()

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  })
})
