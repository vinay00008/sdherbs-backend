const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  tags: [String],
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
