const express = require('express');
const { createReview, getReviewsByMenuItem, updateReview, deleteReview, getAllReviews } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/all', protect, adminOnly, getAllReviews);
router.get('/:menuItemId', getReviewsByMenuItem);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
