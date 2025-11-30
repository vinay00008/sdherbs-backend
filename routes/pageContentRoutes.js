const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/page-content/:page
// @desc    Get content for a specific page
// @access  Public
router.get('/:page', async (req, res) => {
    try {
        let content = await PageContent.findOne({ page: req.params.page });
        if (!content) {
            // Return default empty structure if not found, don't error
            return res.json({ page: req.params.page, title: '', description: '' });
        }
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   PUT /api/page-content/:page
// @desc    Update content for a specific page
// @access  Private (Admin only)
router.put('/:page', protect, async (req, res) => {
    try {
        const { title, description, metaTitle, metaDescription, content } = req.body;

        // Upsert: Update if exists, create if not
        const updatedContent = await PageContent.findOneAndUpdate(
            { page: req.params.page },
            { title, description, metaTitle, metaDescription, content },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(updatedContent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
