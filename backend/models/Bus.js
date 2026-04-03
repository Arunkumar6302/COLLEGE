const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    busNumber: { type: String, required: true },
    capacity: { type: Number, default: 40 },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    status: { type: String, enum: ['idle', 'running', 'stopped', 'maintenance'], default: 'idle' },
    lastLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date, default: Date.now }
    },
    thingspeakId: String,  // Channel ID for IoT device
    thingspeakApiKey: String, // Read API key
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bus', BusSchema);
