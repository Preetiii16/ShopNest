const pool = require('../config/db');

// Place New Order (Transactional Checkout)
exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { address, phone } = req.body;

  const shippingAddress = address || req.user.address;
  const contactPhone = phone || req.user.phone;

  if (!shippingAddress || shippingAddress.trim() === '') {
    return res.status(400).json({ success: false, message: 'Delivery address is required for checkout.' });
  }

  if (!contactPhone || contactPhone.trim() === '') {
    return res.status(400).json({ success: false, message: 'Contact phone number is required for checkout.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Begin MySQL Transaction
    await connection.beginTransaction();

    // 2. Fetch User's Cart
    const [carts] = await connection.query('SELECT id FROM carts WHERE user_id = ? FOR UPDATE', [userId]);
    if (carts.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    const cartId = carts[0].id;

    const [cartItems] = await connection.query(`
      SELECT ci.product_id, ci.quantity, p.product_name, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      FOR UPDATE
    `, [cartId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    // 3. Verify stock availability & calculate backend total
    let backendTotal = 0;

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product_name}". Available: ${item.stock}, Requested: ${item.quantity}. Please update your cart.`
        });
      }

      backendTotal += (item.quantity * parseFloat(item.price));
    }

    const finalTotal = parseFloat(backendTotal.toFixed(2));

    // 4. Create Order record
    const [orderResult] = await connection.query(`
      INSERT INTO orders (user_id, total_amount, address, phone, status)
      VALUES (?, ?, ?, ?, 'Pending')
    `, [userId, finalTotal, shippingAddress.trim(), contactPhone.trim()]);

    const orderId = orderResult.insertId;

    // 5. Create Order Items & Reduce Stock
    for (const item of cartItems) {
      const itemPrice = parseFloat(item.price);

      // Insert into order_items
      await connection.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, itemPrice]);

      // Reduce product stock
      await connection.query(`
        UPDATE products 
        SET stock = stock - ?
        WHERE id = ?
      `, [item.quantity, item.product_id]);
    }

    // 6. Clear User Cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    // 7. Commit Transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with ShopNest.',
      orderId,
      totalAmount: finalTotal,
      status: 'Pending'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create Order Transaction Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during order processing. Transaction rolled back.' });
  } finally {
    if (connection) connection.release();
  }
};

// Get User's Orders History
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order history.' });
  }
};

// Get Order Details by ID (Customer & Admin access check)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isUserAdmin = req.user.role === 'admin';

    let orderSql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    const params = [id];

    if (!isUserAdmin) {
      orderSql += ` AND o.user_id = ?`;
      params.push(userId);
    }

    const [orders] = await pool.query(orderSql, params);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Fetch order items with product metadata
    const [items] = await pool.query(`
      SELECT 
        oi.id as order_item_id,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) as subtotal,
        p.id as product_id,
        p.product_name,
        p.image,
        c.category_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `, [id]);

    return res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Get Order Details Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};
