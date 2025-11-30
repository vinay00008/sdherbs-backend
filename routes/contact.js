const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// 🟢 Submit new contact enquiry (public route)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    res.status(201).json({ msg: 'Enquiry submitted successfully', contact: newContact });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 🟡 Get all enquiries (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const enquiries = await Contact.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch enquiries' });
  }
});

// 🔴 Delete an enquiry (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete enquiry' });
  }
});

module.exports = router;
