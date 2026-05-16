const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.getMe);
router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, ctrl.updateProfile);
router.post('/request-otp', ctrl.requestOTP);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/reset-password', ctrl.resetPassword);

// Admin routes (proxied through gateway as /api/admin/...)
router.get('/admin/stats', protect, authorize('admin'), ctrl.getAdminStats);
router.get('/admin/voters', protect, authorize('admin'), ctrl.getVoters);
router.get('/admin/audit-logs', protect, authorize('admin'), ctrl.getAuditLogs);

// Internal service-to-service routes (not exposed to frontend)
router.post('/internal/mark-voted', ctrl.markVoted);
router.get('/internal/users/:id', ctrl.getUserById);
router.post('/internal/verify-token', ctrl.verifyToken);
router.post('/internal/audit-log', ctrl.createAuditLog);

module.exports = router;
