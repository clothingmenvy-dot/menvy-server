const Seller = require('../models/sellerSchema');
const { validationResult } = require('express-validator');

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sellers = await Seller.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Seller.countDocuments(query);

    res.json({
      success: true,
      data: sellers,
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
      message: 'Error fetching sellers',
      error: error.message
    });
  }
};

// Get single seller
exports.getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seller',
      error: error.message
    });
  }
};

// Create seller
exports.createSeller = async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const seller = new Seller(req.body);
    await seller.save();

    res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating seller',
      error: error.message
    });
  }
};

// Update seller
exports.updateSeller = async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      message: 'Seller updated successfully',
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating seller',
      error: error.message
    });
  }
};

// Delete seller
exports.deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting seller',
      error: error.message
    });
  }
};