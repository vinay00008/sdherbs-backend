const express = require('express');
const router = express.Router();
const ChatKnowledge = require('../models/ChatKnowledge');
const ChatLog = require('../models/ChatLog');

// Get all chat logs
router.get('/logs', async (req, res) => {
    try {
        const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all knowledge items
router.get('/knowledge', async (req, res) => {
    try {
        const knowledge = await ChatKnowledge.find().sort({ createdAt: -1 });
        res.json(knowledge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new knowledge
router.post('/knowledge', async (req, res) => {
    try {
        const { question, answer } = req.body;
        const newKnowledge = new ChatKnowledge({ question, answer });
        await newKnowledge.save();
        res.status(201).json(newKnowledge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete knowledge
router.delete('/knowledge/:id', async (req, res) => {
    try {
        await ChatKnowledge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Knowledge deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
