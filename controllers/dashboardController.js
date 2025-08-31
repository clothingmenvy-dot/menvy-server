// controllers/dashboardController.js
const Seller = require('../models/sellerSchema');
const Sale = require('../models/saleSchema');
const Product = require('../models/productSchema');
const Purchase = require('../models/purchaseSchema');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalProducts = await Product.countDocuments();
    const totalSellers = await Seller.countDocuments();
    const totalSales = await Sale.countDocuments();
    const totalPurchases = await Purchase.countDocuments();
    
    // Get revenue and expenses
    const salesResult = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    
    const purchasesResult = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$total' }
        }
      }
    ]);
    
    const totalRevenue = salesResult.length > 0 ? salesResult[0].totalRevenue : 0;
    const totalExpenses = purchasesResult.length > 0 ? purchasesResult[0].totalExpenses : 0;
    const totalProfit = totalRevenue - totalExpenses;
    
    // Get monthly data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Monthly sales data
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalSales: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Monthly purchases data
    const monthlyPurchases = await Purchase.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalPurchases: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    
    // Create data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const sales = monthlySales.find(s => s._id.year === year && s._id.month === month);
      const purchases = monthlyPurchases.find(p => p._id.year === year && p._id.month === month);
      
      monthlyData.push({
        month: monthNames[date.getMonth()],
        sales: sales ? sales.totalSales : 0,
        purchases: purchases ? purchases.totalPurchases : 0
      });
    }
    
    res.json({
      totalProducts,
      totalSellers,
      totalSales,
      totalPurchases,
      totalRevenue,
      totalProfit,
      monthlyData
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};