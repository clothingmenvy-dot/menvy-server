const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Validation rules
const brandValidation = [
  body('name').trim().notEmpty().withMessage('Brand name is required'),
  body('userId').trim().notEmpty().withMessage('User ID is required')
];

// Routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrand);
router.post('/', brandValidation, brandController.createBrand);
router.put('/:id', brandValidation, brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;