const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const saleRoutes = require('./routes/saleRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors({ origin: ['https://evento-client-eight.vercel.app', 'http://localhost:5173'] }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

// Routes
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/products', productRoutes);
app.use('/api/v2/categories', categoryRoutes);
app.use('/api/v2/brands', brandRoutes);
app.use('/api/v2/sellers', sellerRoutes);
app.use('/api/v2/sales', saleRoutes);
app.use('/api/v2/purchases', purchaseRoutes);
app.use('/api/v2/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// 404 handler
app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, _, res, __) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/api/v2`));

module.exports = app;
