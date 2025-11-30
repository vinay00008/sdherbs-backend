const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  image: String,
  caption: String,
  category: String,
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
