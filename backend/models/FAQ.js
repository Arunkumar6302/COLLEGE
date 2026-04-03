const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
    question: { type: String, required: true, lowercase: true, trim: true },
    answer: { type: String, required: true },
    keywords: [{ type: String, lowercase: true }]
});

module.exports = mongoose.model('FAQ', FAQSchema);
