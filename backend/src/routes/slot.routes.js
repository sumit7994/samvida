const express = require('express')
const slotController = require('../controllers/slot.controller')
const protect = require('../middleware/auth.middleware')

const router = express.Router()

router.get('/', slotController.listSlots)
router.post('/generate', protect, slotController.generateSlots)
router.put('/:id/block', protect, slotController.blockSlot)
router.put('/:id/unblock', protect, slotController.unblockSlot)
router.delete('/:id', protect, slotController.deleteSlot)

module.exports = router
