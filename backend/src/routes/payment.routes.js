const express = require('express')
const paymentController = require('../controllers/payment.controller')

const router = express.Router()

router.post('/create-order/:id', paymentController.createOrder)
router.post('/verify/:id', paymentController.verifyPayment)
router.post('/upi-notify/:id', paymentController.upiNotify)

module.exports = router
