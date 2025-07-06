const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Validation rules
const saleValidation = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

// Routes
router.get('/', saleController.getAllSales);
router.get('/analytics', saleController.getSalesAnalytics);
router.get('/:id', saleController.getSale);
router.post('/', saleValidation, saleController.createSale);
router.put('/:id', saleValidation, saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;