const Sale = require('../models/saleSchema');
const Product = require('../models/productSchema');
const { validationResult } = require('express-validator');

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, startDate, endDate } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('productId', 'name sku')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales',
      error: error.message
    });
  }
};

// Get single sale
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('productId', 'name sku category brand')
      .populate('sellerId', 'name email phone');
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
      error: error.message
    });
  }
};

// Create sale
exports.createSale = async (req, res) => {
  console.log('Create Sale Request Body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Calculate total if not provided
    if (!req.body.total) {
      req.body.total = req.body.quantity * req.body.price;
    }
    const sale = new Sale(req.body);
    await sale.save();

    // Update product stock
    await Product.findByIdAndUpdate(
      req.body.productId,
      { $inc: { stock: -req.body.quantity } }
    );

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating sale',
      error: error.message
    });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const existingSale = await Sale.findById(req.params.id);
    if (!existingSale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // If quantity changed, update product stock
    if (req.body.quantity && req.body.quantity !== existingSale.quantity) {
      const quantityDiff = existingSale.quantity - req.body.quantity;
      await Product.findByIdAndUpdate(
        existingSale.productId,
        { $inc: { stock: quantityDiff } }
      );
    }

    // Calculate total if not provided
    if (!req.body.total && req.body.quantity && req.body.price) {
      req.body.total = req.body.quantity * req.body.price;
    }

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating sale',
      error: error.message
    });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Restore product stock
    await Product.findByIdAndUpdate(
      sale.productId,
      { $inc: { stock: sale.quantity } }
    );

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sale',
      error: error.message
    });
  }
};

// Get sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageSaleValue: { $avg: '$total' },
          totalQuantitySold: { $sum: '$quantity' }
        }
      }
    ]);

    const topProducts = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$productName' },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalSales: 0,
          totalRevenue: 0,
          averageSaleValue: 0,
          totalQuantitySold: 0
        },
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales analytics',
      error: error.message
    });
  }
};