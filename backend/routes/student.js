const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Complaint = require('../models/Complaint');

const authStu = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) { res.status(401).json({ msg: 'Invalid JWT' }); }
};

const studentController = require('../controllers/studentController');

router.get('/profile', authStu, studentController.getProfile);
router.post('/complaint', authStu, studentController.raiseComplaint);
router.get('/complaints', authStu, studentController.getMyComplaints);

module.exports = router;
