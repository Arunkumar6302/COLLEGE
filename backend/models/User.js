const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'driver', 'student', 'faculty'], required: true },
    rollNumber: String, // For students
    employeeId: String, // For faculty
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    seatNumber: String,
    preferredStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
    phoneNumber: String,
    contactNumber: String, // Specifically for Driver/Member contact
    licenseNumber: String, // For Drivers
    fcmToken: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
