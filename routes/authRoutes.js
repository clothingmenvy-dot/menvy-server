const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

// Validation rules
const productsAuthValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required')
];

// Routes
router.post('/products', productsAuthValidation, authController.authenticateProducts);
router.get('/products/verify', authController.verifyProductsToken);

module.exports = router;