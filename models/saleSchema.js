const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  bill_no: {
    type: String,
  },
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

// Virtual for formatted total
saleSchema.virtual('formattedTotal').get(function () {
  return `$${this.total.toFixed(2)}`;
});

// Pre-save middleware to generate bill_no
saleSchema.pre('save', async function (next) {
  if (!this.bill_no) {
    // Generate random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.bill_no = `MV${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
