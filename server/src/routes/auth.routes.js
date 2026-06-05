const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, getAllUsers, getAdmins, createAdmin, deleteAdmin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/admins', protect, adminOnly, getAdmins);
router.post('/admins', protect, adminOnly, registerValidation, createAdmin);
router.delete('/admins/:id', protect, adminOnly, deleteAdmin);

module.exports = router;
