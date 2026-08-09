const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'shopnest_jwt_super_secret_key_2026_safe_hash';

// Register Customer
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, address, role, status) VALUES (?, ?, ?, ?, ?, "customer", "active")',
      [name.trim(), email.toLowerCase().trim(), phone || null, hashedPassword, address || null]
    );

    const userId = result.insertId;

    // Create empty cart for new user automatically
    await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);

    const token = jwt.sign(
      { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || '',
        address: address || '',
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Login (Customer & Admin)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

// Update Customer Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, currentPassword, newPassword } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password.' });
      }

      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET name = ?, phone = ?, address = ?, password = ? WHERE id = ?', [
        name.trim(), phone || null, address || null, hashedNewPassword, userId
      ]);
    } else {
      await pool.query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [
        name.trim(), phone || null, address || null, userId
      ]);
    }

    const [updatedUsers] = await pool.query('SELECT id, name, email, phone, address, role FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating profile.' });
  }
};
