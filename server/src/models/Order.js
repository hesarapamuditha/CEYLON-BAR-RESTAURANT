const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  subtotal: { type: Number, required: true },
  specialInstructions: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // For guest orders
    guestName: { type: String, default: '' },
    guestEmail: { type: String, default: '' },
    guestPhone: { type: String, default: '' },

    items: [orderItemSchema],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },

    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery'],
      required: true,
    },
    deliveryAddress: {
      street: String,
      city: String,
      postalCode: String,
    },
    tableNumber: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled', 'served', 'takeaway', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },

    notes: { type: String, default: '' },
    estimatedTime: { type: Number, default: 30 }, // minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
