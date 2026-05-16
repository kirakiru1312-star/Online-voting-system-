const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendOTP } = require('../services/emailService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, phone, nationalId, profession, nationality, region, subCity, kebele } = req.body;

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
      nationalId, profession, nationality, region, subCity, kebele, role: 'voter'
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldName = field === 'email' ? 'Email' : field === 'phone' ? 'Phone Number' : 'National ID (FAN)';
      return res.status(400).json({ message: `${fieldName} already exists (taken).` });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, hasVoted: req.user.hasVoted } });
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otpCode -otpExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.hasVoted) return res.status(403).json({ message: 'Profile cannot be updated after voting.' });

    const { firstName, lastName, email, age, phone, nationalId, profession, nationality, region, subCity, kebele } = req.body;

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
    res.json({ message: 'Profile updated successfully.', user: { id: user._id, name: user.name, email: user.email, role: user.role, hasVoted: user.hasVoted } });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldName = field === 'email' ? 'Email' : field === 'phone' ? 'Phone Number' : 'National ID (FAN)';
      return res.status(400).json({ message: `${fieldName} already exists (taken).` });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/request-otp
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60000);
    await user.save();
    await sendOTP(user.email, otp);
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.otpCode !== otp || user.otpExpire < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();
    res.json({ message: 'OTP verified successfully.', success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Internal endpoint: mark user as voted (called by voting-service)
// POST /internal/mark-voted
exports.markVoted = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { hasVoted: true, votedAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Internal endpoint: get user by id (called by voting-service / election-service)
// GET /internal/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otpCode -otpExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Internal endpoint: verify JWT and return user (used by other services)
// POST /internal/verify-token
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -otpCode -otpExpire');
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/admin/stats  (voter stats for navbar)
exports.getAdminStats = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalVoted = await User.countDocuments({ hasVoted: true });
    res.json({ totalVoters, totalVoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/voters
exports.getVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' }).select('-password').sort({ createdAt: -1 });
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Internal endpoint: receive audit log from other services
// POST /internal/audit-log
exports.createAuditLog = async (req, res) => {
  try {
    const { userId, userName, userEmail, action, status, reason, severity, ipAddress, userAgent, location, details } = req.body;
    await AuditLog.create({
      user: userId || null,
      userName: userName || 'Guest',
      userEmail: userEmail || 'N/A',
      action, status, reason,
      severity: severity || (status === 'rejected' ? 'WARNING' : 'INFO'),
      ipAddress: ipAddress || '0.0.0.0',
      userAgent: userAgent || 'Unknown',
      location: location || 'Unknown',
      details
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
