const Reservation = require('../models/Reservation');

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Public
const createReservation = async (req, res, next) => {
  try {
    const { name, email, phone, date, time, partySize, occasion, specialRequests } = req.body;

    const reservationDate = new Date(date);
    if (reservationDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Reservation date must be in the future' });
    }

    const reservation = await Reservation.create({
      name,
      email,
      phone,
      date: reservationDate,
      time,
      partySize,
      occasion: occasion || '',
      specialRequests: specialRequests || '',
      user: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Reservation submitted! We will confirm shortly.',
      reservation: {
        _id: reservation._id,
        confirmationCode: reservation.confirmationCode,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        status: reservation.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reservation by confirmation code
// @route   GET /api/reservations/lookup/:code
// @access  Public
const lookupReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ confirmationCode: req.params.code });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations (Admin)
// @route   GET /api/reservations
// @access  Admin
const getAllReservations = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('user', 'name email')
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(query),
    ]);

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), reservations });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (Admin)
// @route   PUT /api/reservations/:id
// @access  Admin
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, message: 'Reservation updated', reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation (owner or admin)
// @route   DELETE /api/reservations/:id
// @access  Private
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    if (req.user.role !== 'admin' && reservation.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReservation, lookupReservation, getMyReservations, getAllReservations, updateReservation, cancelReservation };
