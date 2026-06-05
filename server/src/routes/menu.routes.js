const express = require('express');
const {
  getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem,
  getAllCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/menu.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

// Menu Items
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', protect, adminOnly, createMenuItem);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
