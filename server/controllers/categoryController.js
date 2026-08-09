const pool = require('../config/db');

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY category_name ASC');
    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get All Categories Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

// Admin: Create Category
exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [existing] = await pool.query('SELECT id FROM categories WHERE category_name = ?', [category_name.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const [result] = await pool.query('INSERT INTO categories (category_name) VALUES (?)', [category_name.trim()]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category: { id: result.insertId, category_name: category_name.trim() }
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating category.' });
  }
};

// Admin: Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [existing] = await pool.query('SELECT id FROM categories WHERE category_name = ? AND id != ?', [category_name.trim(), id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Another category with this name already exists.' });
    }

    await pool.query('UPDATE categories SET category_name = ? WHERE id = ?', [category_name.trim(), id]);

    return res.json({
      success: true,
      message: 'Category updated successfully!',
      category: { id: parseInt(id, 10), category_name: category_name.trim() }
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating category.' });
  }
};

// Admin: Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if products exist in this category
    const [products] = await pool.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category. Products are assigned to this category. Delete or reassign products first.' 
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting category.' });
  }
};
