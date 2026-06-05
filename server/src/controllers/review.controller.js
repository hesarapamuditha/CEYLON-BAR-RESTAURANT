const Review = require('../models/Review');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { menuItem, rating, comment } = req.body;

    const existing = await Review.findOne({ user: req.user._id, menuItem });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this item' });
    }

    const review = await Review.create({ user: req.user._id, menuItem, rating, comment });
    const populated = await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Review added', review: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a menu item
// @route   GET /api/reviews/:menuItemId
// @access  Public
const getReviewsByMenuItem = async (req, res, next) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.json({ success: true, message: 'Review updated', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (owner) or Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Admin
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getReviewsByMenuItem, updateReview, deleteReview, getAllReviews };
