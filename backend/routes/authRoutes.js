const express = require('express');
const router = express.Router();
const { register, login, getMe, requestOTP, verifyOTP, resetPassword, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
