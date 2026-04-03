const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    startLocation: {
        name: { type: String },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    endLocation: {
        name: { type: String },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', RouteSchema);

