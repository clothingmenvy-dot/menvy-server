const Purchase = require('../models/purchaseSchema');
const Product = require('../models/productSchema');
const { validationResult } = require('express-validator');

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, startDate, endDate } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(query)
      .populate('productId', 'name sku')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Purchase.countDocuments(query);

    res.json({
      success: true,
      data: purchases,
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
      message: 'Error fetching purchases',
      error: error.message
    });
  }
};

// Get single purchase
exports.getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('productId', 'name sku category brand');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase',
      error: error.message
    });
  }
};

// Create purchase
exports.createPurchase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if product exists
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate total if not provided
    if (!req.body.total) {
      req.body.total = req.body.quantity * req.body.price;
    }

    const purchase = new Purchase(req.body);
    await purchase.save();

    // Update product stock
    await Product.findByIdAndUpdate(
      req.body.productId,
      { $inc: { stock: req.body.quantity } }
    );

    res.status(201).json({
      success: true,
      message: 'Purchase recorded successfully',
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
};

// Update purchase
exports.updatePurchase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const existingPurchase = await Purchase.findById(req.params.id);
    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // If quantity changed, update product stock
    if (req.body.quantity && req.body.quantity !== existingPurchase.quantity) {
      const quantityDiff = req.body.quantity - existingPurchase.quantity;
      await Product.findByIdAndUpdate(
        existingPurchase.productId,
        { $inc: { stock: quantityDiff } }
      );
    }

    // Calculate total if not provided
    if (!req.body.total && req.body.quantity && req.body.price) {
      req.body.total = req.body.quantity * req.body.price;
    }

    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Purchase updated successfully',
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating purchase',
      error: error.message
    });
  }
};

// Delete purchase
exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Reduce product stock
    await Product.findByIdAndUpdate(
      purchase.productId,
      { $inc: { stock: -purchase.quantity } }
    );

    await Purchase.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Purchase deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting purchase',
      error: error.message
    });
  }
};

// Get purchase analytics
exports.getPurchaseAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Purchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalExpenses: { $sum: '$total' },
          averagePurchaseValue: { $avg: '$total' },
          totalQuantityPurchased: { $sum: '$quantity' }
        }
      }
    ]);

    const topSuppliers = await Purchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$supplierName',
          totalPurchases: { $sum: 1 },
          totalExpenses: { $sum: '$total' }
        }
      },
      { $sort: { totalExpenses: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalPurchases: 0,
          totalExpenses: 0,
          averagePurchaseValue: 0,
          totalQuantityPurchased: 0
        },
        topSuppliers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase analytics',
      error: error.message
    });
  }
};