const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Route = require('../models/Route');

const busController = require('../controllers/busController');

// GET route details for a specific bus
router.get('/:id/route', busController.getBusRoute);

module.exports = router;
