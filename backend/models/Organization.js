const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    address: String,
    contactEmail: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
