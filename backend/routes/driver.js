const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Bus = require('../models/Bus');
const GPSLog = require('../models/GPSLog');

const authDriver = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.user.role !== 'driver') return res.status(403).json({ msg: 'Forbidden' });
        req.user = decoded.user;
        next();
    } catch (err) { res.status(401).json({ msg: 'Invalid token' }); }
};

const driverController = require('../controllers/driverController');

router.get('/mybus', authDriver, driverController.getMyBus);
router.post('/trip', authDriver, driverController.updateTripStatus);
router.post('/location', authDriver, driverController.postLocation);

module.exports = router;
