const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @desc  Register a new voter
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, phone, nationalId, profession, nationality, region, subCity, kebele } = req.body;
    
    // Basic validation for mandatory unique fields
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists (taken).' });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: 'Phone Number already exists (taken).' });

    const existingId = await User.findOne({ nationalId });
    if (existingId) return res.status(400).json({ message: 'National ID (FAN) already exists (taken).' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      firstName, lastName, email: email.toLowerCase(), password: hashed, age, phone,
      nationalId, profession, nationality, region, subCity, kebele,
      role: 'voter'
    });
    
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldName = field === 'email' ? 'Email' : field === 'phone' ? 'Phone Number' : 'National ID (FAN)';
      return res.status(400).json({ message: `${fieldName} already exists (taken).` });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, hasVoted: req.user.hasVoted } });
};
