const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    order: Number, // Sequence of stops
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stop', StopSchema);
