const mongoose = require('mongoose');

// Helper function to generate random code
function generateRandomCode() {
  const numberPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letterPart = '';
  for (let i = 0; i < 4; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return `${numberPart}-${letterPart}`;
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    default: generateRandomCode,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
  return `$${this.price.toFixed(2)}`;
});

module.exports = mongoose.model('Product', productSchema);
