const Order = require('../models/Order');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Public (with optional auth)
const createOrder = async (req, res, next) => {
  try {
    const { items, orderType, deliveryAddress, tableNumber, guestName, guestEmail, guestPhone, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Calculate totals
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(totalPrice * 0.1 * 100) / 100; // 10% tax
    const deliveryFee = orderType === 'delivery' ? 3.5 : 0;
    const grandTotal = Math.round((totalPrice + tax + deliveryFee) * 100) / 100;

    const orderItems = items.map((item) => ({
      menuItem: item.menuItem,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: Math.round(item.price * item.quantity * 100) / 100,
      specialInstructions: item.specialInstructions || '',
    }));

    const order = await Order.create({
      user: req.user ? req.user._id : null,
      guestName: guestName || '',
      guestEmail: guestEmail || '',
      guestPhone: guestPhone || '',
      items: orderItems,
      totalPrice,
      tax,
      deliveryFee,
      grandTotal,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image').populate('user', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only admin or order owner can view
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, orderType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.menuItem', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order stats (Admin)
// @route   GET /api/orders/stats
// @access  Admin
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$grandTotal' },
        },
      },
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    res.json({
      success: true,
      stats,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getOrderStats };
