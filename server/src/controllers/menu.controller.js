const fs = require('fs');
const path = require('path');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

const processBase64Image = (imageString) => {
  if (!imageString || !imageString.startsWith('data:image/')) {
    return imageString;
  }

  try {
    const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return imageString;
    }

    const type = matches[1];
    const extension = type.split('/')[1] || 'png';
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `menu-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, buffer);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Failed to save base64 image:', error);
    return imageString;
  }
};

const formatItemImage = (item, req) => {
  if (!item) return item;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const itemObj = item.toObject ? item.toObject() : item;

  if (itemObj.image && itemObj.image.startsWith('/uploads')) {
    itemObj.image = `${baseUrl}${itemObj.image}`;
  }
  return itemObj;
};

// ======================== MENU ITEMS ========================

// @desc    Get all menu items (with filters)
// @route   GET /api/menu
// @access  Public
const getAllMenuItems = async (req, res, next) => {
  try {
    const { category, search, dietary, available, featured, sort, page = 1, limit = 20 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (featured === 'true') query.isFeatured = true;
    if (dietary) query.dietaryTags = { $in: dietary.split(',') };
    if (search) query.$text = { $search: search };

    let sortObj = { displayOrder: 1, name: 1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    if (sort === 'price-desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      MenuItem.find(query).populate('category', 'name').sort(sortObj).skip(skip).limit(parseInt(limit)),
      MenuItem.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      items: items.map(item => formatItemImage(item, req)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name description');
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, item: formatItemImage(item, req) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
const createMenuItem = async (req, res, next) => {
  try {
    const processedImage = processBase64Image(req.body.image);
    const item = await MenuItem.create({ ...req.body, image: processedImage });
    const populated = await item.populate('category', 'name');
    res.status(201).json({ success: true, message: 'Menu item created', item: formatItemImage(populated, req) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
const updateMenuItem = async (req, res, next) => {
  try {
    const processedImage = processBase64Image(req.body.image);
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { ...req.body, image: processedImage }, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, message: 'Menu item updated', item: formatItemImage(item, req) });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

// ======================== CATEGORIES ========================

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem,
  getAllCategories, createCategory, updateCategory, deleteCategory,
};
