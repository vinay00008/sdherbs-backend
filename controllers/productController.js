const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

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
    console.log("Create Product Request Body:", req.body);
    console.log("Create Product File:", req.file);
    console.log("Create Product Headers:", req.headers['content-type']);

    const { name, description, price, stock, category } = req.body;

    // Handle image upload
    let images = [];
    if (req.file) {
      // Cloudinary returns the path in req.file.path
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
    console.log("Saved Product:", savedProduct);
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    console.log("Update Product Request Body:", req.body);
    console.log("Update Product File:", req.file);

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
      updateData.images = [req.file.path];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    console.log("Updated Product Result:", updatedProduct);
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
      const imageUrl = product.images[0];
      // Extract public_id from URL
      // Example: https://res.cloudinary.com/demo/image/upload/v1570979139/folder/sample.jpg
      // Public ID: folder/sample
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];

      // We need to handle both local uploads (old) and Cloudinary uploads (new)
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
