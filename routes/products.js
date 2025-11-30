const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 🔧 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 🟢 Add Product
router.post('/', auth, upload.array('images', 6), async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !category) return res.status(400).json({ msg: 'Name and category required' });

    const imagePaths = (req.files || []).map(f => '/uploads/' + path.basename(f.path));
    const newProduct = new Product({ name, description, category, images: imagePaths });
    await newProduct.save();

    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// 🟢 Get All Products (populated category)
router.get('/', async (req, res) => {
  const products = await Product.find().populate('category', 'name');
  res.json(products);
});

// 🟢 Get Single Product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  res.json(product);
});

// 🟡 Edit Product (Admin only)
router.put('/:id', auth, upload.array('images', 6), async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const update = { name, description, category };

    if (req.files && req.files.length > 0) {
      update.images = req.files.map(f => '/uploads/' + path.basename(f.path));
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Update failed', error: err.message });
  }
});

// 🔴 Delete Product (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed', error: err.message });
  }
});

// 🟢 Get Products by Category
router.get('/category/:categoryId', async (req, res) => {
  const products = await Product.find({ category: req.params.categoryId });
  res.json(products);
});

module.exports = router;
