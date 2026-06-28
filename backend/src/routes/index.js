const express = require('express')
const appointmentRoutes = require('./appointment.routes')
const authRoutes = require('./auth.routes')
const businessRoutes = require('./business.routes')
const paymentRoutes = require('./payment.routes')
const serviceRoutes = require('./service.routes')
const slotRoutes = require('./slot.routes')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/business', businessRoutes)
router.use('/services', serviceRoutes)
router.use('/slots', slotRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/payment', paymentRoutes)

module.exports = router
