const express = require('express');
const { createReservation, lookupReservation, getMyReservations, getAllReservations, updateReservation, cancelReservation } = require('../controllers/reservation.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/', createReservation);                          // Public
router.get('/lookup/:code', lookupReservation);               // Public
router.get('/my', protect, getMyReservations);                // Private
router.get('/', protect, adminOnly, getAllReservations);       // Admin
router.put('/:id', protect, adminOnly, updateReservation);    // Admin
router.delete('/:id', protect, cancelReservation);            // Private

module.exports = router;
