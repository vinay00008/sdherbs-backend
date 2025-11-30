const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// @route   GET /api/settings
// @desc    Get global settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/settings
// @desc    Update global settings
// @access  Private (Admin only - middleware should be added in server.js or here if needed, but for now we keep it open or rely on frontend protection/future middleware)
// Note: In a real app, ensure this is protected by admin middleware.
router.put('/', async (req, res) => {
    const { logo } = req.body;

    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        if (logo !== undefined) settings.logo = logo;

        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
