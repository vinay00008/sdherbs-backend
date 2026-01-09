const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

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
    // Since we use multer-storage-cloudinary, req.file.path IS the Cloudinary URL.
    let images = [];
    if (req.file && req.file.path) {
      images.push(req.file.path);
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
    // No need to unlink manually as Cloudinary storage handles it or it's not on disk
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

    if (req.file && req.file.path) {
      updateData.images = [req.file.path];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete image from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        const imageUrl = product.images[0];
        // Extract public_id from URL: 
        // format: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/my_image.jpg
        if (imageUrl.includes('cloudinary')) {
          // Get the last part and remove extension
          const parts = imageUrl.split('/');
          const filename = parts.pop().split('.')[0];
          const folder = parts.pop(); // e.g. 'products' or 'sdherbs_uploads'
          const publicId = `${folder}/${filename}`; // e.g., 'sdherbs_uploads/my_image'

          // Note: Folder name matching must be exact to middleware config 'sdherbs_uploads'
          // Ideally we should store public_id in DB, but parsing URL works if simple

          await cloudinary.uploader.destroy(publicId);
        }
      } catch (delErr) {
        console.error("Cloudinary delete error (non-fatal):", delErr);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: err.message });
  }
};
