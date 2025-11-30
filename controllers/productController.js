const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    const list = await Product.find(query).populate('category').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Handle image upload
    let images = [];
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sdherbs/products"
      });
      images.push(result.secure_url);
      // Clean up local file
      fs.unlinkSync(req.file.path);
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      category,
      images
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    let updateData = {
      name,
      description,
      price,
      stock,
      category
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sdherbs/products"
      });
      updateData.images = [result.secure_url];
      fs.unlinkSync(req.file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete image from Cloudinary
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0];
      // Extract public_id from URL
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];

      if (imageUrl.includes('cloudinary')) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: err.message });
  }
};
