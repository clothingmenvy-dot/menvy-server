# Inventory Management System - Backend

A comprehensive backend API for inventory management built with Express.js, MongoDB, and Node.js.

## Features

- **Product Management**: CRUD operations for products with categories and brands
- **Seller Management**: Manage seller information and contacts
- **Sales Tracking**: Record and track sales transactions
- **Purchase Management**: Track inventory purchases and suppliers
- **Authentication**: Secure products access with JWT tokens
- **Analytics**: Sales and purchase analytics with aggregation
- **Validation**: Input validation with express-validator
- **Security**: Rate limiting, CORS, and security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv for configuration

## Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string
   - Set JWT secret and other configurations

4. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/products` - Authenticate for products access
- `GET /api/auth/products/verify` - Verify products token

### Products
- `GET /api/products` - Get all products (with pagination, search, filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)
- `GET /api/products/low-stock` - Get low stock products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/:id` - Get single brand
- `POST /api/brands` - Create new brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Sellers
- `GET /api/sellers` - Get all sellers (with pagination, search)
- `GET /api/sellers/:id` - Get single seller
- `POST /api/sellers` - Create new seller
- `PUT /api/sellers/:id` - Update seller
- `DELETE /api/sellers/:id` - Delete seller

### Sales
- `GET /api/sales` - Get all sales (with pagination, search, date filters)
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/analytics` - Get sales analytics

### Purchases
- `GET /api/purchases` - Get all purchases (with pagination, search, date filters)
- `GET /api/purchases/:id` - Get single purchase
- `POST /api/purchases` - Create new purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase
- `GET /api/purchases/analytics` - Get purchase analytics

## Database Models

### Product
- Basic product information (name, description, SKU, price, stock)
- Category and brand associations
- Product variants support
- User ownership tracking

### Category & Brand
- Simple name-based categorization
- User-specific categories and brands
- Soft delete functionality

### Seller
- Complete contact information
- Address details with validation
- Email and phone validation

### Sale
- Product and seller associations
- Quantity, price, and total calculations
- Payment method and status tracking
- Automatic stock updates

### Purchase
- Product and supplier associations
- Quantity, price, and total calculations
- Invoice tracking and status
- Automatic stock updates

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domains
- **Helmet**: Security headers for protection
- **Input Validation**: Comprehensive validation with express-validator
- **JWT Authentication**: Secure token-based authentication
- **Environment Variables**: Sensitive data protection

## Error Handling

- Comprehensive error responses with proper HTTP status codes
- Validation error details for client-side handling
- Development vs production error information
- Mongoose validation error handling

## Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading for large datasets
- **Aggregation**: Complex analytics with MongoDB aggregation
- **Soft Deletes**: Data preservation with isActive flags

## Environment Variables

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Products Authentication
PRODUCTS_USERNAME=admin
PRODUCTS_PASSWORD=products123
```

## Development

- **Logging**: Morgan for HTTP request logging in development
- **Hot Reload**: Use nodemon for development (`npm run dev`)
- **Error Stack**: Full error stacks in development mode
- **Database Logging**: Mongoose debug mode available

## Production Considerations

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up proper logging
- Use process managers (PM2)
- Set up monitoring and health checks