const express = require('express')
const { body } = require('express-validator')
const serviceController = require('../controllers/service.controller')
const protect = require('../middleware/auth.middleware')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()

router.get('/', serviceController.listServices)
router.post(
  '/',
  protect,
  body('name').notEmpty().withMessage('Service name is required'),
  body('duration').isNumeric().withMessage('Duration is required'),
  body('price').isNumeric().withMessage('Price is required'),
  validateRequest,
  serviceController.createService,
)
router.put('/:id', protect, serviceController.updateService)
router.put('/:id/activate', protect, serviceController.activateService)
router.put('/:id/deactivate', protect, serviceController.deactivateService)
router.delete('/:id', protect, serviceController.deactivateService)

module.exports = router
