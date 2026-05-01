const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @desc  Register a new voter
// @route POST /api/auth/register
exports.register = [
  body('firstName').matches(/^[A-Za-z ]+$/).withMessage('First name must contain letters only'),
  body('lastName').matches(/^[A-Za-z ]+$/).withMessage('Last name must contain letters only'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isNumeric().withMessage('Age must be a number').custom(val => parseInt(val) >= 18).withMessage('Must be 18+'),
  body('phone').custom(value => {
    if (!value.startsWith('+251')) throw new Error('Phone must start with +251');
    const digits = value.replace('+251', '');
    if (!['9', '7'].includes(digits.charAt(0))) throw new Error('Phone must start with 9 or 7');
    if (digits.length !== 9) throw new Error('Phone must contain exactly 9 digits');
    return true;
  }),
  body('nationalId').isLength({ min: 16 }).withMessage('National ID must be at least 16 digits'),
  body('nationality').equals('Ethiopian').withMessage('Nationality must be Ethiopian'),
  body('region').notEmpty().withMessage('Region is required'),
  body('profession').matches(/^[A-Za-z ]+$/).withMessage('Profession must contain letters only'),
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, age, phone, nationalId, profession, nationality, region, subCity, kebele } = req.body;
      
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(400).json({ message: 'Email already exists (taken).' });

      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: 'Phone Number already exists (taken).' });

      const existingId = await User.findOne({ nationalId });
      if (existingId) return res.status(400).json({ message: 'National ID (FAN) already exists (taken).' });

      if (profession.toLowerCase() === 'soldier') return res.status(403).json({ message: 'Soldiers are not allowed to register' });

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
  },
];

exports.login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res) => {
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
  },
];

exports.getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, hasVoted: req.user.hasVoted } });
};
