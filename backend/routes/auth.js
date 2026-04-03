const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = require('../controllers/authController');

// @route   POST api/auth/register-org
// @desc    Register a new organization and admin
router.post('/register-org', authController.registerOrg);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

module.exports = router;
