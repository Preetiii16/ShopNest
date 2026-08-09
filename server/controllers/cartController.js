const pool = require('../config/db');

// Helper to get or create cart ID for current user
const getOrCreateCartId = async (userId) => {
  const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (carts.length > 0) {
    return carts[0].id;
  }
  const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

// Get Cart for Logged-In User
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(userId);

    const [items] = await pool.query(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.product_name,
        p.price,
        p.stock,
        p.image,
        c.category_name,
        (ci.quantity * p.price) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE ci.cart_id = ?
      ORDER BY ci.id DESC
    `, [cartId]);

    let totalAmount = 0;
    let itemCount = 0;

    items.forEach(item => {
      totalAmount += parseFloat(item.subtotal);
      itemCount += item.quantity;
    });

    return res.json({
      success: true,
      cartId,
      items,
      itemCount,
      totalAmount: parseFloat(totalAmount.toFixed(2))
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shopping cart.' });
  }
};

// Add Product to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const qty = parseInt(quantity || 1, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    // Verify product stock
    const [products] = await pool.query('SELECT id, product_name, price, stock FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = products[0];
    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: `"${product.product_name}" is currently Out of Stock.` });
    }

    const cartId = await getOrCreateCartId(userId);

    // Check if product is already in cart
    const [existingItems] = await pool.query('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);

    if (existingItems.length > 0) {
      const currentQty = existingItems[0].quantity;
      const newQty = currentQty + qty;

      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} units available, you already have ${currentQty} in cart).`
        });
      }

      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItems[0].id]);
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qty} units. Only ${product.stock} units available in stock.`
        });
      }

      await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, qty]);
    }

    return res.json({
      success: true,
      message: `"${product.product_name}" added to cart successfully!`
    });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while adding to cart.' });
  }
};

// Update Cart Item Quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required.' });
    }

    const cartId = await getOrCreateCartId(userId);

    // Check if product exists in cart
    const [cartItems] = await pool.query('SELECT ci.id, ci.quantity, p.stock, p.product_name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ? AND ci.product_id = ?', [cartId, productId]);

    if (cartItems.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    if (qty <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ?', [cartItems[0].id]);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    if (qty > cartItems[0].stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItems[0].stock} units available in stock for "${cartItems[0].product_name}".`
      });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [qty, cartItems[0].id]);

    return res.json({
      success: true,
      message: 'Cart updated successfully.'
    });
  } catch (error) {
    console.error('Update Cart Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating cart.' });
  }
};

// Remove Product from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cartId = await getOrCreateCartId(userId);
    await pool.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);

    return res.json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while removing cart item.' });
  }
};
