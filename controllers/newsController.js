const News = require('../models/News');

exports.getAll = async (req, res) => {
  try {
    const list = await News.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || '';
    const doc = await News.create({ title, description, image, tags: tags ? tags.split(',').map(t => t.trim()) : [] });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    if (data.tags) data.tags = data.tags.split(',').map(t => t.trim());
    const updated = await News.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
