const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk");
const Bus = require('../models/Bus');
const Route = require('../models/Route');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route   POST api/ai/ask
// @desc    Ask AI Chatbot questions about bus system
router.post('/ask', async (req, res) => {
    const { question, userContext } = req.body;
    try {
        // Fetch organization specific info to provide context
        const buses = await Bus.find({ organizationId: userContext.orgId }).populate('routeId');
        const routes = await Route.find({ organizationId: userContext.orgId });

        const contextString = `
            You are a helpful college bus system assistant. 
            Organization context:
            Available Buses: ${buses.map(b => `${b.busNumber} (Route: ${b.routeId ? b.routeId.routeName : 'N/A'})`).join(', ')}
            Available Routes: ${routes.map(r => r.routeName).join(', ')}
            User Question: ${question}
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an assistant for the Smart College Bus Tracking System. Provide concise and accurate info."
                },
                {
                    role: "user",
                    content: contextString
                }
            ],
            model: "llama3-8b-8192",
        });

        res.json({ answer: chatCompletion.choices[0].message.content });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'AI Chatbot service unavailable' });
    }
});

module.exports = router;
