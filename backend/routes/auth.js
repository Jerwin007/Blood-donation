const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ✅ Ensure models/User.js exists
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ REGISTER Route
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, username, password } = req.body;

    // Basic validation
    if (!full_name || !email || !username || !password) {
      return res.status(400).json({ msg: 'Please fill all required fields.' });
    }

    // Check for existing user (email or username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email)
        return res.status(400).json({ msg: 'Email already in use.' });
      return res.status(400).json({ msg: 'Username already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      full_name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Create JWT Token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration.' });
  }
});

// ✅ LOGIN Route (email or username)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email
    if (!identifier || !password)
      return res.status(400).json({ msg: 'Please enter all fields.' });

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    // Sign token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ msg: 'Server error during login.' });
  }
});

// ✅ Protected Route Example (Get Current User)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ msg: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token.' });
  }
};

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    res.json({ user });
  } catch (err) {
    console.error('❌ Fetch user error:', err);
    res.status(500).json({ msg: 'Server error fetching user data.' });
  }
});

module.exports = router;
