const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
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
  supplierId: {
    type: String,
    trim: true
  },
  supplierName: {
    type: String,
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
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

// Virtual for formatted total
purchaseSchema.virtual('formattedTotal').get(function() {
  return `$${this.total.toFixed(2)}`;
});

module.exports = mongoose.model('Purchase', purchaseSchema);