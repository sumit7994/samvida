const express = require('express')
const { body } = require('express-validator')
const appointmentController = require('../controllers/appointment.controller')
const protect = require('../middleware/auth.middleware')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()

router.post(
  '/',
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.phone').isMobilePhone('en-IN').withMessage('Valid phone is required'),
  body('customer.email').isEmail().withMessage('Valid email is required'),
  body('serviceId').notEmpty().withMessage('Service is required'),
  body('slotId').optional().notEmpty().withMessage('Slot is required'),
  body('preferredDate').optional().isISO8601().withMessage('Valid preferred date is required'),
  body('preferredTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Valid preferred time is required'),
  validateRequest,
  appointmentController.createAppointment,
)
router.get('/track/:phone', appointmentController.trackByPhone)
router.get('/pay/:id', appointmentController.getAppointment)
router.get('/all', protect, appointmentController.listAppointments)
router.get('/pending', protect, (req, res, next) => {
  req.query.status = 'pending'
  appointmentController.listAppointments(req, res, next)
})
router.get('/payment-pending', protect, (req, res, next) => {
  req.query.status = 'payment_pending'
  appointmentController.listAppointments(req, res, next)
})
router.post(
  '/walkin',
  protect,
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.phone').isMobilePhone('en-IN').withMessage('Valid phone is required'),
  body('serviceId').notEmpty().withMessage('Service is required'),
  body('slotId').notEmpty().withMessage('Slot is required'),
  validateRequest,
  appointmentController.createWalkIn,
)
router.post(
  '/:id/approve',
  protect,
  body('tokenAmount').isFloat({ min: 0 }).withMessage('Token amount must be zero or more'),
  validateRequest,
  appointmentController.approveAppointment,
)
router.post('/:id/reject', protect, appointmentController.rejectAppointment)
router.post(
  '/:id/propose-time',
  protect,
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^\d{2}:\d{2}$/).withMessage('Valid time is required'),
  validateRequest,
  appointmentController.proposeTime,
)
router.post('/:id/confirm-proposed-time', appointmentController.confirmProposedTime)
router.post('/:id/cancel', protect, appointmentController.cancelAppointment)
router.post('/:id/confirm-upi', protect, appointmentController.confirmUpi)
router.post('/:id/complete', protect, appointmentController.completeAppointment)
router.post('/:id/no-show', protect, appointmentController.noShowAppointment)

module.exports = router
