const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [String], // store file URLs like /uploads/file.jpg
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
