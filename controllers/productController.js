const Product = require('../models/productSchema');
const { validationResult } = require('express-validator');

// Helper function for pagination and sorting
const buildQueryOptions = (queryParams) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;
  
  return {
    skip: (page - 1) * limit,
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };
};

// Helper function to build search query
const buildSearchQuery = (queryParams) => {
  const { search, category, brand } = queryParams;
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) query.category = category;
  if (brand) query.brand = brand;
  
  return query;
};

// Error response handler
const handleErrorResponse = (res, error, defaultMessage) => {
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'SKU already exists'
    });
  }
  
  res.status(500).json({
    success: false,
    message: defaultMessage,
    error: error.message
  });
};

// Validate request
const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
    return false;
  }
  return true;
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const query = buildSearchQuery(req.query);
    const options = buildQueryOptions(req.query);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(options.sort)
        .limit(options.limit)
        .skip(options.skip),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    handleErrorResponse(res, error, 'Error fetching products');
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    handleErrorResponse(res, error, 'Error fetching product');
  }
};

// Create product
exports.createProduct = async (req, res) => {
  console.log('Request body:', req.body);


  try {
    const product = new Product({
      ...req.body,
      price: Number(req.body.price), // Convert to number
      stock: Number(req.body.stock)   // Convert to number
    });
    
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Detailed error:', error);
    handleErrorResponse(res, error, 'Error creating product');
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  if (!validateRequest(req, res)) return;

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    handleErrorResponse(res, error, 'Error updating product');
  }
};

// Delete product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id,
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    handleErrorResponse(res, error, 'Error deleting product');
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    const products = await Product.find({
      stock: { $lte: threshold },
      isActive: true
    }).sort({ stock: 1 });

    res.json({
      success: true,
      data: products,
      count: products.length,
      threshold
    });
  } catch (error) {
    handleErrorResponse(res, error, 'Error fetching low stock products');
  }
};  