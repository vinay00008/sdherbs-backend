const express = require('express');
const router = express.Router();
const axios = require('axios');

// @desc    Generate speech from text
// @route   POST /api/voice/speak
// @access  Public (or protected if needed)
router.post('/speak', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice (Rachel)

        if (!apiKey) {
            console.error('ElevenLabs API Key is missing');
            return res.status(500).json({ message: 'Server configuration error: Missing TTS API Key' });
        }

        const response = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            data: {
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            },
            responseType: 'stream', // Important for audio
        });

        // Pipe the audio stream directly to the response
        res.set('Content-Type', 'audio/mpeg');
        response.data.pipe(res);

    } catch (err) {
        console.error('ElevenLabs TTS Error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Error generating speech' });
    }
});

module.exports = router;
