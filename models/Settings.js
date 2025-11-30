const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    logo: { type: String, default: "" }, // URL to the logo image
    // Future settings can be added here (e.g., site title, contact info override, etc.)
}, { timestamps: true });

// We only need one document for settings, so we can treat it as a singleton in the controller
module.exports = mongoose.model('Settings', SettingsSchema);
