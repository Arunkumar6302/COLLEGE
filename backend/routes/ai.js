const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk");
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const FAQ = require('../models/FAQ');
const jwt = require('jsonwebtoken');

const authStu = (req, res, next) => {
        const token = req.header('x-auth-token');
        if (!token) {
            console.log("AI: No token provided. Attempting guest context.");
            return next();
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;
            console.log("AI: Authenticated User Org:", req.user.orgId);
            next();
        } catch (err) { 
            console.log("AI: Token verification failed. Falling back.");
            next(); 
        }
};

// Seed Default FAQs for production readiness
const seedFAQs = async () => {
    const count = await FAQ.countDocuments();
    if (count === 0) {
        await FAQ.insertMany([
            { question: "where is my bus", answer: "You can view the live real-time location of your assigned bus in the 'Live Tracking' section of your dashboard.", keywords: ["where", "location", "tracking", "track"] },
            { question: "what is my bus timing", answer: "Standard college bus timings are 8:30 AM for morning pickup and 4:30 PM for evening departure. Check the 'Bus Details' tab for route-specific schedules.", keywords: ["timing", "time", "schedule", "when"] },
            { question: "how to raise complaint", answer: "Navigate to the 'Complaints' section on your dashboard, fill in the title and description of your issue, and click submit.", keywords: ["complaint", "issue", "report", "problem"] },
            { question: "who is my driver", answer: "You can find your driver's name and contact number in the 'Bus Details' section once a bus is assigned to you.", keywords: ["driver", "contact", "phone", "driver details"] }
        ]);
        console.log("Chatbot FAQs Seeded successfully");
    }
};
seedFAQs();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route   GET api/ai/faqs
// @desc    Get all predefined questions
router.get('/faqs', async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ error: "Failed to load FAQs" });
    }
});

// @route   POST api/ai/ask
// @desc    Ask AI Chatbot questions about bus system
router.post('/ask', authStu, async (req, res) => {
    const { question, userContext } = req.body;
    
    if (!question) return res.json({ answer: "How can I help you today?", source: 'default' });

    // Normalize: Lowercase, remove punctuation, trim
    const msg = question.toLowerCase().replace(/[^\w\s]/g, "").trim();

    try {
        // 1. STRICT KEYWORD MATCHING (MANDATORY FIRST)
        if (msg.includes("bus") || msg.includes("location")) {
            return res.json({ 
                answer: "You can track your bus in the Live Tracking section.", 
                source: 'predefined' 
            });
        }

        if (msg.includes("timing")) {
            return res.json({ 
                answer: "Check your bus timing in dashboard.", 
                source: 'predefined' 
            });
        }

        if (msg.includes("driver")) {
            return res.json({ 
                answer: "Driver details are available in your dashboard.", 
                source: 'predefined' 
            });
        }

        if (msg.includes("complaint")) {
            return res.json({ 
                answer: "Go to Complaint Management and submit your issue.", 
                source: 'predefined' 
            });
        }

        // 2. CHECK DATABASE FAQS (OPTIONAL EXTRA LAYER)
        const faqs = await FAQ.find();
        let matchedFAQ = faqs.find(f => {
            const q = f.question.toLowerCase().replace(/[^\w\s]/g, "").trim();
            return msg.includes(q);
        });

        if (matchedFAQ) {
            return res.json({ answer: matchedFAQ.answer, source: 'database' });
        }

        // 3. AI FALLBACK
        const targetOrgId = userContext?.orgId || req.user?.orgId;
        
        if (!targetOrgId || !process.env.GROQ_API_KEY) {
             return res.json({ 
                answer: "Please contact admin for more details.", 
                source: 'safe-fallback' 
            });
        }

        console.log("Chatbot: Calling Groq AI...");
        const buses = await Bus.find({ organizationId: targetOrgId }).populate('route');
        const routes = await Route.find({ organizationId: targetOrgId });

        const contextString = `
            You are an assistant for a college bus tracking system.
            Buses: ${buses.length > 0 ? buses.map(b => b.busNumber).join(', ') : 'None'}
            Routes: ${routes.length > 0 ? routes.map(r => r.routeName).join(', ') : 'None'}
            Question: ${question}
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Reply concisely like a bus transport office." },
                { role: "user", content: contextString }
            ],
            model: "llama3-8b-8192",
        });

        res.json({ answer: chatCompletion.choices[0].message.content, source: 'ai' });

    } catch (err) {
        console.error("CHATBOT ERROR:", err.message);
        // Step 4: Final No-Fail Message
        res.json({ 
            answer: "Please contact admin for more details.",
            source: 'emergency-fallback'
        });
    }
});

module.exports = router;
