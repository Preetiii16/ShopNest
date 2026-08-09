const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'shopnest_jwt_super_secret_key_2026_safe_hash';

    const decoded = jwt.verify(token, secret);

    // Fetch latest user details from MySQL
    const [rows] = await pool.query('SELECT id, name, email, phone, role, status, address FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token. User not found.' });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by an administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

module.exports = verifyToken;
