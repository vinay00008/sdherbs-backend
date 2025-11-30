const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    userMessage: {
        type: String,
        required: true,
    },
    botReply: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    isUnanswered: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
