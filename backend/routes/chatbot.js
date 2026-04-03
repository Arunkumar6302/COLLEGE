const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// Seed Database with 20 comprehensive questions
const seedFAQs = async () => {
    try {
        const count = await FAQ.countDocuments();
        if (count < 20) {
            await FAQ.deleteMany({}); // clear existing
            const faqsToSeed = [
                { question: "where is my bus", answer: "You can track your bus in real-time by going to the 'Live Tracking' section in your dashboard.", keywords: ["where", "bus", "location", "track", "tracking"] },
                { question: "what is the bus timing", answer: "Standard morning pickup is at 8:30 AM and evening departure is at 4:30 PM. Check your specific route in the 'My Bus' tab.", keywords: ["timing", "time", "schedule", "when"] },
                { question: "who is my driver", answer: "Driver name and contact phone number are available in your dashboard under 'Bus Details'.", keywords: ["driver", "contact", "number", "who"] },
                { question: "how to raise a complaint", answer: "Go to the 'Complaints' section on your dashboard, describe your issue, and click Submit. Admin will review it shortly.", keywords: ["complaint", "issue", "problem", "report", "raise"] },
                { question: "hello or hi", answer: "Hello! I am your Smart College Bus Assistant. Feel free to ask me anything about your transport.", keywords: ["hello", "hi", "hey", "greetings"] },
                { question: "my bus is late", answer: "If the bus is delayed, check 'Live Tracking' for real-time ETA. Heavy traffic or weather might cause delays.", keywords: ["late", "delayed", "delay"] },
                { question: "bus fee or payment", answer: "Bus fees are paid per semester through the main college fee portal. For exact amounts, please contact the finance office.", keywords: ["fee", "payment", "pay", "cost", "money"] },
                { question: "bus pass", answer: "Your college ID card acts as your bus pass. Keep it with you at all times during travel. No physical pass is needed.", keywords: ["pass", "card", "id"] },
                { question: "i lost my item", answer: "If you left an item on the bus, please visit the Transport Office or ask your driver the next morning.", keywords: ["lost", "item", "found", "forgot", "bag"] },
                { question: "can i change my route", answer: "To change your bus route, please submit a written request to the Transport Office for reallocation.", keywords: ["change", "route", "stop", "shift"] },
                { question: "is the bus running today", answer: "The bus operates on all official college working days. It does not run on public holidays or Sundays.", keywords: ["running", "today", "holiday", "sunday", "working", "open"] },
                { question: "what if bus breaks down", answer: "In case of a breakdown, a backup bus will be dispatched immediately. Wait safely inside or near the current bus.", keywords: ["breakdown", "broken", "emergency", "backup"] },
                { question: "can my friend travel", answer: "No, the college bus is strictly for registered students only. Non-registered students cannot board.", keywords: ["friend", "guest", "other", "relative"] },
                { question: "behavior rules", answer: "Students must maintain discipline. Standing near the door, shouting, or destroying seats will lead strictly to suspension.", keywords: ["rules", "behavior", "discipline", "stand"] },
                { question: "evening special bus", answer: "For students staying back for sports or library, a special late bus runs at 6:30 PM on specific routes only.", keywords: ["evening", "special", "late", "sports", "library", "exam"] },
                { question: "how to contact admin", answer: "You can find the Transport Admin's contact details in the 'Help Center' section of your portal.", keywords: ["admin", "office", "transport", "management"] },
                { question: "air conditioning", answer: "AC is turned on based on weather conditions and standard guidelines. Drivers cannot change it per individual request.", keywords: ["ac", "air", "conditioning"] },
                { question: "can i sit anywhere", answer: "First two rows are reserved for faculty and physically challenged students. Otherwise, seats are first-come, first-serve.", keywords: ["seat", "sit", "where", "reserved"] },
                { question: "stop location changed", answer: "Drivers stop only at designated points. If you want a new stop, gather multiple signatures and approach the admin.", keywords: ["new stop", "change stop"] },
                { question: "refund", answer: "Bus fees are generally non-refundable once the semester begins. Contact finance for special cases.", keywords: ["refund", "cancel"] },
                { question: "I want to track driver", answer: "The driver's live GPS helps you track the bus. Check Live Tracking on your dashboard.", keywords: ["track", "gps"] }
            ];
            await FAQ.insertMany(faqsToSeed);
            console.log("Chatbot: Successfully seeded 20 FAQs to database.");
        }
    } catch (err) {
        console.error("Chatbot: DB Seed Error", err);
    }
};
seedFAQs();

router.post('/', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.json({ reply: "I'm here to help! Please check your dashboard for more details." });
    }

    // Normalize input (Lowercase, remove punctuation ?, ., !, trim)
    const normalized = message.toLowerCase().replace(/[?\.!]/g, "").trim();

    try {
        const faqs = await FAQ.find();
        
        let bestMatch = null;
        
        // Exact Question Match Priority
        bestMatch = faqs.find(f => normalized.includes(f.question));

        // Keyword Match Fallback
        if (!bestMatch) {
            for (let faq of faqs) {
                // Ignore empty keyword arrays just in case
                if (!faq.keywords || faq.keywords.length === 0) continue;
                
                for (let keyword of faq.keywords) {
                    // Match separate words properly instead of substrings
                    // e.g. "hi" shouldn't match "this" 
                    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
                    if (keywordRegex.test(normalized)) {
                        bestMatch = faq;
                        break;
                    }
                }
                if (bestMatch) break;
            }
        }

        if (bestMatch) {
            // ----- DYNAMIC LOGIC FOR ALL DB LOOKUPS -----
            const token = req.header('x-auth-token');
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const student = await User.findById(decoded.user.id);
                    
                    if (student && student.assignedBus) {
                        // Driver Details
                        if (bestMatch.question === "who is my driver") {
                            const bus = await Bus.findById(student.assignedBus).populate('driverId');
                            if (bus && bus.driverId) {
                                const driverName = bus.driverId.name || 'Unknown';
                                const driverPhone = bus.driverId.contactNumber || bus.driverId.phoneNumber || 'Not provided';
                                return res.json({ 
                                    reply: `Your driver is **${driverName}**. You can contact them at **${driverPhone}**.` 
                                });
                            } else {
                                return res.json({ reply: "A bus is assigned to you, but no driver has been allocated to it yet." });
                            }
                        }
                        
                        // Bus Location / Bus Number Details
                        if (bestMatch.question === "where is my bus" || bestMatch.question === "what is the bus timing") {
                            const bus = await Bus.findById(student.assignedBus).populate('route');
                            if (bus) {
                                const busNumber = bus.busNumber || 'Unknown';
                                const routeName = bus.route ? bus.route.name : 'Unknown';
                                
                                if (bestMatch.question === "where is my bus") {
                                    return res.json({ 
                                        reply: `Your assigned bus is **Bus ${busNumber}** on route **${routeName}**. You can track its location in real-time by going to the 'Live Tracking' section in your dashboard.` 
                                    });
                                } else {
                                    return res.json({ 
                                        reply: `You are taking **Bus ${busNumber}** on route **${routeName}**. Standard morning pickup is at 8:30 AM and evening departure is 4:30 PM. Check 'Live Tracking' for real-time ETA.` 
                                    });
                                }
                            }
                        }
                    } else {
                        // Unassigned fallback for dynamic questions
                        if (bestMatch.question === "who is my driver" || bestMatch.question === "where is my bus" || bestMatch.question === "what is the bus timing") {
                             return res.json({ reply: "You don't have a bus assigned yet. Please contact the transport office for allocation." });
                        }
                    }
                } catch (e) {
                    console.error('Chatbot Dynamic Fetch Error:', e);
                }
            }
            // ------------------------------------

            return res.json({ reply: bestMatch.answer });
        }

        // Final Fallback
        return res.json({ 
            reply: "I couldn't find an exact match for that! Please check your dashboard or contact the transport office for more details." 
        });
    } catch (err) {
        console.error("Chatbot Match Error:", err);
        return res.json({ 
            reply: "I couldn't find an exact match for that! Please check your dashboard or contact the transport office for more details." 
        });
    }
});

module.exports = router;
