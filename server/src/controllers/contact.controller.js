const Contact = require('../models/Contact');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contact = await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({
      success: true,
      message: "Thank you for reaching out! We'll get back to you soon.",
      id: contact._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/contact
// @access  Admin
const getAllMessages = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [messages, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(query),
    ]);

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read / reply (Admin)
// @route   PUT /api/contact/:id
// @access  Admin
const updateMessage = async (req, res, next) => {
  try {
    const { isRead, isReplied, replyMessage } = req.body;
    const update = {};
    if (isRead !== undefined) update.isRead = isRead;
    if (isReplied !== undefined) update.isReplied = isReplied;
    if (replyMessage) update.replyMessage = replyMessage;

    const message = await Contact.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    res.json({ success: true, message: 'Message updated', data: message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message (Admin)
// @route   DELETE /api/contact/:id
// @access  Admin
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact, getAllMessages, updateMessage, deleteMessage };
