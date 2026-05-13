const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../services/emailService');
const crypto = require('crypto');

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

// @desc  Request OTP for email verification
// @route POST /api/auth/request-otp
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60000); // 10 minutes

    user.otpCode = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await sendOTP(user.email, otp);
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Verify OTP
// @route POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || user.otpCode !== otp || user.otpExpire < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // OTP is valid - we can either clear it now or leave it for the next step
    // Clear OTP after successful verification to ensure single-use
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: 'OTP verified successfully.', success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get full voter profile
// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otpCode -otpExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update voter profile (only allowed before voting)
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.hasVoted) {
      return res.status(403).json({ message: 'Profile cannot be updated after voting.' });
    }

    const { firstName, lastName, email, age, phone, nationalId, profession, nationality, region, subCity, kebele } = req.body;

    // Check unique fields against other users
    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingEmail) return res.status(400).json({ message: 'Email already exists (taken).' });
    }
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
      if (existingPhone) return res.status(400).json({ message: 'Phone Number already exists (taken).' });
    }
    if (nationalId && nationalId !== user.nationalId) {
      const existingId = await User.findOne({ nationalId, _id: { $ne: user._id } });
      if (existingId) return res.status(400).json({ message: 'National ID (FAN) already exists (taken).' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (firstName || lastName) user.name = `${firstName || user.firstName} ${lastName || user.lastName}`;
    if (email) user.email = email.toLowerCase();
    if (age) user.age = age;
    if (phone) user.phone = phone;
    if (nationalId) user.nationalId = nationalId;
    if (profession) user.profession = profession;
    if (nationality) user.nationality = nationality;
    if (region) user.region = region;
    if (subCity) user.subCity = subCity;
    if (kebele) user.kebele = kebele;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, hasVoted: user.hasVoted }
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

// @desc  Reset Password
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
