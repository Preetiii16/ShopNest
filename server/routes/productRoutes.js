const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public product browsing
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin product CRUD
router.post('/', verifyToken, verifyAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;
