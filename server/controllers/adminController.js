const pool = require('../config/db');

// Get Dashboard Overview Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query(`SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'`);
    const [[{ totalProducts }]] = await pool.query(`SELECT COUNT(*) as totalProducts FROM products`);
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) as totalOrders FROM orders`);
    const [[{ totalSales }]] = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) as totalSales FROM orders WHERE status != 'Cancelled'`);

    // Fetch products with stock <= 5
    const [lowStockProducts] = await pool.query(`
      SELECT p.id, p.product_name, p.price, p.stock, c.category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= 5
      ORDER BY p.stock ASC
      LIMIT 10
    `);

    // Fetch 5 recent orders
    const [recentOrders] = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: parseFloat(totalSales),
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard statistics.' });
  }
};

// Get All Registered Users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, phone, role, status, address, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve registered users.' });
  }
};

// Toggle User Status (Active / Inactive)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating logged in admin or sole admin
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
    }

    const [users] = await pool.query('SELECT id, name, role, status FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    if (user.role === 'admin') {
      const [adminCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND status = "active"');
      if (adminCount[0].count <= 1 && user.status === 'active') {
        return res.status(400).json({ success: false, message: 'Cannot deactivate the only active admin account.' });
      }
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    return res.json({
      success: true,
      message: `User "${user.name}" status updated to ${newStatus}.`,
      status: newStatus
    });
  } catch (error) {
    console.error('Toggle User Status Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating user status.' });
  }
};

// Get All Orders (with status filter and search)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, q } = req.query;

    let sql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    if (q && q.trim() !== '') {
      sql += ` AND (o.id = ? OR u.name LIKE ? OR u.email LIKE ?)`;
      const searchPattern = `%${q.trim()}%`;
      const searchId = isNaN(q.trim()) ? 0 : parseInt(q.trim(), 10);
      params.push(searchId, searchPattern, searchPattern);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const [orders] = await pool.query(sql, params);

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders list.' });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const [orders] = await pool.query('SELECT id, status FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    return res.json({
      success: true,
      message: `Order #${id} status updated to "${status}".`,
      status
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating order status.' });
  }
};
