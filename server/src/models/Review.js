const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One review per user per menu item
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true });

// Update MenuItem averageRating & reviewCount after save
reviewSchema.post('save', async function () {
  const MenuItem = require('./MenuItem');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { menuItem: this.menuItem } },
    {
      $group: {
        _id: '$menuItem',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await MenuItem.findByIdAndUpdate(this.menuItem, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
