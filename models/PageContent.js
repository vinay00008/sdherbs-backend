const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    page: { type: String, required: true, unique: true }, // e.g., 'activity', 'home', 'about'
    title: { type: String },
    description: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    // Flexible structure for other potential fields
    content: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('PageContent', PageContentSchema);
