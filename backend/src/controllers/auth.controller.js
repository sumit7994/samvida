const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const sendEmail = require('../utils/sendEmail')
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

exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim()
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires')

  const genericResponse = {
    success: true,
    message: 'If this email exists, a reset link has been sent.',
  }

  if (!user) {
    res.json(genericResponse)
    return
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000)
  await user.save({ validateBeforeSave: false })

  const baseUrl = process.env.CLIENT_URL || process.env.BOOKING_PAGE_URL || ''
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/admin/reset-password/${resetToken}`

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Samvida admin password',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.55;color:#102522">
          <h2>Reset your password</h2>
          <p>Use this link to reset your Samvida admin password. It expires in 15 minutes.</p>
          <p><a href="${resetUrl}">Reset password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
      text: `Reset your Samvida admin password: ${resetUrl}`,
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    throw new AppError('Could not send reset email. Please try again later.', 500)
  }

  res.json(genericResponse)
})

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires')

  if (!user) {
    throw new AppError('Reset link is invalid or expired.', 400)
  }

  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  res.json({ success: true, message: 'Password reset successfully.' })
})
