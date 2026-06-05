const express = require('express');
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/', createOrder);                               // Public (guest or logged-in)
router.get('/my', protect, getMyOrders);                     // Private
router.get('/stats', protect, adminOnly, getOrderStats);     // Admin
router.get('/', protect, adminOnly, getAllOrders);            // Admin
router.get('/:id', protect, getOrderById);                   // Private
router.put('/:id/status', protect, adminOnly, updateOrderStatus); // Admin

module.exports = router;
