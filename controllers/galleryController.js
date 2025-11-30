const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const list = await Gallery.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { caption, category } = req.body;
    let image = req.body.image || '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sdherbs/gallery"
      });
      image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const doc = await Gallery.create({ caption, category, image });
    res.json(doc);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sdherbs/gallery"
      });
      data.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updated = await Gallery.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Gallery.findById(req.params.id);
    if (doc && doc.image && doc.image.includes('cloudinary')) {
      const publicId = doc.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
