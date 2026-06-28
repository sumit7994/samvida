const crypto = require('crypto')
const Razorpay = require('razorpay')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const Appointment = require('../models/Appointment.model')
const NotificationService = require('../utils/NotificationService')

let razorpayClient

function appointmentQuery(identifier) {
  return identifier?.toUpperCase().startsWith('SAM-')
    ? { bookingCode: identifier.toUpperCase() }
    : { _id: identifier }
}

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Razorpay credentials are not configured', 401)
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }

  return razorpayClient
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  )
}

exports.createOrder = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne(appointmentQuery(req.params.id))
  if (!appointment) throw new AppError('Appointment not found', 404)
  if (appointment.status !== 'payment_pending') throw new AppError('Payment is not open', 400)

  const amount = Math.round(Number(appointment.token.amount || 0) * 100)
  if (amount < 100) {
    throw new AppError('Razorpay amount must be at least 100 paise', 400)
  }

  let order

  try {
    order = await getRazorpayClient().orders.create({
      amount,
      currency: 'INR',
      receipt: appointment.bookingCode || appointment._id.toString(),
    })
  } catch (error) {
    const statusCode = error.statusCode || error.error?.status_code
    if (statusCode === 401) {
      throw new AppError('Razorpay authentication failed', 401)
    }

    throw new AppError('Could not create Razorpay order', 500)
  }

  appointment.token.razorpayOrderId = order.id
  await appointment.save()

  res.json({
    success: true,
    data: {
      id: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    },
  })
})

exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
  const appointment = await Appointment.findOne(appointmentQuery(req.params.id))

  if (!appointment) throw new AppError('Appointment not found', 404)
  if (appointment.status !== 'payment_pending') throw new AppError('Payment is not open', 400)

  if (appointment.token.razorpayOrderId && appointment.token.razorpayOrderId !== razorpay_order_id) {
    throw new AppError('Razorpay order does not match this booking', 400)
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Razorpay verification fields are required', 400)
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Razorpay credentials are not configured', 401)
  }

  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    throw new AppError('Invalid Razorpay signature', 400)
  }

  appointment.status = 'confirmed'
  appointment.token.paymentMethod = 'razorpay'
  appointment.token.razorpayOrderId = razorpay_order_id
  appointment.token.razorpayPaymentId = razorpay_payment_id
  appointment.token.paidAt = new Date()
  await appointment.save()

  NotificationService.bookingConfirmed(appointment).catch((error) => {
    console.error(`[notification] bookingConfirmed ${appointment.bookingCode} failed: ${error.message}`)
  })

  res.json({ success: true, data: appointment })
})

exports.upiNotify = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne(appointmentQuery(req.params.id))
  if (!appointment) throw new AppError('Appointment not found', 404)
  if (appointment.status !== 'payment_pending') throw new AppError('UPI claim is not open', 400)

  appointment.status = 'upi_claimed'
  appointment.token.paymentMethod = 'upi'
  await appointment.save()
  await NotificationService.upiClaimed(appointment)

  res.json({ success: true, data: appointment })
})
