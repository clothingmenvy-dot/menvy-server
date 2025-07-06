const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

// Validation rules
const sellerValidation = [
  body('name').trim().notEmpty().withMessage('Seller name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

// Routes
router.get('/', sellerController.getAllSellers);
router.get('/:id', sellerController.getSeller);
router.post('/', sellerValidation, sellerController.createSeller);
router.put('/:id', sellerValidation, sellerController.updateSeller);
router.delete('/:id', sellerController.deleteSeller);

module.exports = router;