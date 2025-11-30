const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// 🟢 Add Category (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: 'Category name required' });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ msg: 'Category already exists' });

    const cat = new Category({ name, description });
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🟢 Get All Categories
router.get('/', async (req, res) => {
  const cats = await Category.find().sort({ createdAt: -1 });
  res.json(cats);
});

// 🔴 Delete Category (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting', error: err.message });
  }
});

module.exports = router;
