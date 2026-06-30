const express = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/auth.controller')
const protect = require('../middleware/auth.middleware')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router()

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
  authController.login,
)
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Valid email is required'),
  validateRequest,
  authController.forgotPassword,
)
router.post(
  '/reset-password/:token',
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest,
  authController.resetPassword,
)
router.get('/me', protect, authController.me)
router.put(
  '/me',
  protect,
  body('name').optional().trim().notEmpty().withMessage('Owner name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().notEmpty().withMessage('Owner phone is required'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest,
  authController.updateMe,
)

module.exports = router
