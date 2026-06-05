const express = require('express');
const { submitContact, getAllMessages, updateMessage, deleteMessage } = require('../controllers/contact.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, adminOnly, getAllMessages);
router.put('/:id', protect, adminOnly, updateMessage);
router.delete('/:id', protect, adminOnly, deleteMessage);

module.exports = router;
