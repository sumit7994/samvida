const express = require('express')
const { body } = require('express-validator')
const businessController = require('../controllers/business.controller')
const protect = require('../middleware/auth.middleware')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()

router.get('/', businessController.getBusiness)
router.put(
  '/',
  protect,
  body('businessName').optional().trim().notEmpty().withMessage('Business name is required'),
  body('category').optional().isIn(['salon', 'clinic', 'coaching', 'spa', 'gym', 'other']).withMessage('Invalid category'),
  body('ownerEmail').optional({ checkFalsy: true }).isEmail().withMessage('Valid owner email is required'),
  body('upiId').optional().trim().notEmpty().withMessage('UPI ID is required'),
  body('slotDuration').optional().isNumeric().withMessage('Slot duration must be a number'),
  body('autoGenerateSlots').optional().isBoolean().withMessage('Auto-generate slots must be true or false'),
  body('bookingMode').optional().isIn(['slot', 'flexible']).withMessage('Invalid booking mode'),
  body('tokenAmount').optional().isNumeric().withMessage('Token amount must be a number'),
  validateRequest,
  businessController.updateBusiness,
)

module.exports = router
