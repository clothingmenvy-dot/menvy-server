const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Validation rules
const purchaseValidation = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

// Routes
router.get('/', purchaseController.getAllPurchases);
router.get('/analytics', purchaseController.getPurchaseAnalytics);
router.get('/:id', purchaseController.getPurchase);
router.post('/', purchaseValidation, purchaseController.createPurchase);
router.put('/:id', purchaseValidation, purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;