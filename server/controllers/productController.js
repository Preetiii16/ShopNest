const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get All Products (with Search, Filter by Category/Price, and Sorting)
exports.getAllProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort } = req.query;

    let sql = `
      SELECT p.*, c.category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Search by product name or description
    if (q && q.trim() !== '') {
      sql += ` AND (p.product_name LIKE ? OR p.description LIKE ?)`;
      const searchTerm = `%${q.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filter by Category ID
    if (category && category !== 'all') {
      sql += ` AND p.category_id = ?`;
      params.push(parseInt(category, 10));
    }

    // Filter by Price Range
    if (minPrice && !isNaN(minPrice)) {
      sql += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      sql += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      sql += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      sql += ` ORDER BY p.price DESC`;
    } else {
      sql += ` ORDER BY p.created_at DESC`; // Default newest first
    }

    const [products] = await pool.query(sql, params);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get All Products Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT p.*, c.category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      product: rows[0]
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

// Admin: Create Product
exports.createProduct = async (req, res) => {
  try {
    const { product_name, category_id, description, price, stock } = req.body;

    if (!product_name || !category_id || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, category, price, and stock are required.' });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
    }

    if (parsedStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative.' });
    }

    let imageName = 'default-product.jpg';
    if (req.file) {
      imageName = req.file.filename;
    }

    const [result] = await pool.query(`
      INSERT INTO products (category_id, product_name, description, price, stock, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [category_id, product_name.trim(), description || '', parsedPrice, parsedStock, imageName]);

    const [newProduct] = await pool.query(`
      SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `, [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct[0]
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating product.' });
  }
};

// Admin: Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, category_id, description, price, stock } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (parsedPrice < 0 || parsedStock < 0) {
      return res.status(400).json({ success: false, message: 'Price and stock cannot be negative.' });
    }

    let imageName = existing[0].image;
    if (req.file) {
      imageName = req.file.filename;
      // Delete old custom uploaded image if exists and not default
      if (existing[0].image && !existing[0].image.endsWith('.jpg') && existing[0].image.startsWith('prod-')) {
        const oldPath = path.join(__dirname, '../uploads/products', existing[0].image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    await pool.query(`
      UPDATE products 
      SET category_id = ?, product_name = ?, description = ?, price = ?, stock = ?, image = ?
      WHERE id = ?
    `, [category_id, product_name.trim(), description || '', parsedPrice, parsedStock, imageName, id]);

    const [updated] = await pool.query(`
      SELECT p.*, c.category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `, [id]);

    return res.json({
      success: true,
      message: 'Product updated successfully!',
      product: updated[0]
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating product.' });
  }
};

// Admin: Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT image FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const imageName = existing[0].image;

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (imageName && imageName.startsWith('prod-')) {
      const oldPath = path.join(__dirname, '../uploads/products', imageName);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting product.' });
  }
};
