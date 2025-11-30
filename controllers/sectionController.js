const SectionControl = require('../models/SectionControl');

exports.getSections = async (req, res) => {
  try {
    const sections = await SectionControl.find().sort({ order: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { name, key, order } = req.body;
    const s = await SectionControl.create({ name, key, order });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const s = await SectionControl.findByIdAndUpdate(id, data, { new: true });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    await SectionControl.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
