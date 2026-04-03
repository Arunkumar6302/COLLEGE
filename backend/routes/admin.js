const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');

// Middleware to verify Admin role
const authAdmin = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
        req.user = decoded.user;
        next();
    } catch (err) { res.status(401).json({ msg: 'Token invalid' }); }
};

const adminController = require('../controllers/adminController');

// --- ROUTE & STOP MANAGEMENT ---
router.get('/route', authAdmin, adminController.getRoutes);
router.post('/route', authAdmin, adminController.createRoute);
router.post('/route/:id/stops', authAdmin, adminController.addStopToRoute);
router.post('/assign-route', authAdmin, adminController.assignRoute);

// --- STUDENT & FACULTY MANAGEMENT ---
router.post('/members', authAdmin, adminController.createMember);
router.get('/users/:role', authAdmin, adminController.getUsersByRole);
router.put('/users/:id', authAdmin, adminController.updateUser);
router.delete('/users/:id', authAdmin, adminController.deleteUser);

// --- BUS MANAGEMENT ---
router.get('/buses', authAdmin, adminController.getBuses);
router.post('/buses', authAdmin, adminController.createBus);
router.put('/buses/:id', authAdmin, adminController.updateBus);
router.delete('/buses/:id', authAdmin, adminController.deleteBus);

// --- STUDENT-BUS ASSIGNMENT ---
router.post('/assign-student', authAdmin, adminController.assignStudent);
router.post('/remove-student', authAdmin, adminController.removeStudent);

// --- FACULTY-BUS ASSIGNMENT ---
router.post('/assign-faculty', authAdmin, adminController.assignFaculty);
router.post('/remove-faculty', authAdmin, adminController.removeFaculty);

// --- COMPLAINTS MANAGEMENT ---
router.get('/complaints', authAdmin, adminController.getComplaints);
router.put('/complaints/:id', authAdmin, adminController.updateComplaint);

module.exports = router;
