const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const list = await Blog.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    let image = req.body.image || '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "sdherbs/blogs"
      });
      image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const doc = await Blog.create({ title, content, author, image, tags: tags ? tags.split(',').map(t => t.trim()) : [] });
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
        folder: "sdherbs/blogs"
      });
      data.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    if (data.tags) data.tags = data.tags.split(',').map(t => t.trim());
    const updated = await Blog.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Blog.findById(req.params.id);
    if (doc && doc.image && doc.image.includes('cloudinary')) {
      const publicId = doc.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
