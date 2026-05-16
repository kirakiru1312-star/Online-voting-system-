const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// These routes are mounted at /api/admin in auth-service server.js
// Gateway sends /api/admin/stats → auth-service → /api/admin/stats ✅
router.get('/stats',      protect, authorize('admin'), ctrl.getAdminStats);
router.get('/voters',     protect, authorize('admin'), ctrl.getVoters);
router.get('/audit-logs', protect, authorize('admin'), ctrl.getAuditLogs);

module.exports = router;
