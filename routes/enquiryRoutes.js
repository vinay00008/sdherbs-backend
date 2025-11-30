const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { protect } = require('../middleware/authMiddleware');

// POST create enquiry (Public)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message, productId } = req.body;
        const enquiry = new Enquiry({
            name,
            email,
            phone,
            message,
            product: productId || null
        });
        await enquiry.save();
        res.status(201).json({ message: 'Enquiry submitted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all enquiries (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        const enquiries = await Enquiry.find()
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE enquiry (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update status (Admin only)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(enquiry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
