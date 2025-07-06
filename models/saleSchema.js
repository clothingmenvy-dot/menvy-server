const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  sellerName: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
}, {
  timestamps: true
});

// Indexes for better performance
saleSchema.index({ productId: 1 });
saleSchema.index({ sellerId: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ status: 1 });

// Virtual for formatted total
saleSchema.virtual('formattedTotal').get(function() {
  return `$${this.total.toFixed(2)}`;
});

module.exports = mongoose.model('Sale', saleSchema);