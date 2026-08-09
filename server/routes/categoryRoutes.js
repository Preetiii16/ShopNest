const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');

// Public category listing
router.get('/', categoryController.getAllCategories);

// Admin category CRUD
router.post('/', verifyToken, verifyAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, verifyAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, verifyAdmin, categoryController.deleteCategory);

module.exports = router;
