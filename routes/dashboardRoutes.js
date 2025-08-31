// routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard statistics
router.get('/', dashboardController.getDashboardStats);

module.exports = router;