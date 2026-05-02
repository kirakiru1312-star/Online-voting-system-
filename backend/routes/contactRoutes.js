const express = require('express');
const router = express.Router();
const { 
  getMessages, 
  getMessageStats, 
  markAsRead, 
  deleteMessage, 
  replyToMessage,
  submitMessage 
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to submit a message
router.post('/', submitMessage);

// Admin routes
router.get('/admin', protect, authorize('admin'), getMessages);
router.get('/admin/stats', protect, authorize('admin'), getMessageStats);
router.put('/admin/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/admin/:id', protect, authorize('admin'), deleteMessage);
router.post('/admin/reply', protect, authorize('admin'), replyToMessage);

module.exports = router;
