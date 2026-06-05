const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    time: {
      type: String,
      required: [true, 'Reservation time is required'],
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
      max: [50, 'Party size cannot exceed 50'],
    },
    tableNumber: {
      type: Number,
      default: null,
    },
    occasion: {
      type: String,
      enum: ['birthday', 'anniversary', 'business', 'date', 'family', 'other', ''],
      default: '',
    },
    specialRequests: {
      type: String,
      default: '',
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    confirmationCode: {
      type: String,
      unique: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-generate confirmation code
reservationSchema.pre('save', function (next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'CBR-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
