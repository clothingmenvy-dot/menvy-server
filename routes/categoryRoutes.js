const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Validation rules
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('userId').trim().notEmpty().withMessage('User ID is required')
];

// Routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryValidation, categoryController.createCategory);
router.put('/:id', categoryValidation, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;