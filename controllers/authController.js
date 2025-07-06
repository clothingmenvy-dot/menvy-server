const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Products authentication
exports.authenticateProducts = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check credentials against environment variables
    if (username !== process.env.PRODUCTS_USERNAME || password !== process.env.PRODUCTS_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials for products access'
      });
    }

    // Generate JWT token for products access
    const token = jwt.sign(
      { 
        username,
        access: 'products',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' } // 30 minutes
    );

    res.json({
      success: true,
      message: 'Products authentication successful',
      token,
      expiresIn: '30m'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during products authentication',
      error: error.message
    });
  }
};

// Verify products token
exports.verifyProductsToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.access !== 'products') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token for products access'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        username: decoded.username,
        access: decoded.access,
        timestamp: decoded.timestamp
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};