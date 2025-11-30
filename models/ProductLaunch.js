const mongoose = require('mongoose');

const ProductLaunchSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductLaunch', ProductLaunchSchema);
