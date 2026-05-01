const express = require('express');
const router = express.Router();
const { getParties, getParty, createParty, updateParty, deleteParty, voteForParty } = require('../controllers/partyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getParties);
router.post('/vote', protect, voteForParty);
router.get('/:id', getParty);
router.post('/', protect, authorize('admin'), upload.single('logo'), createParty);
router.put('/:id', protect, authorize('admin'), upload.single('logo'), updateParty);
router.delete('/:id', protect, authorize('admin'), deleteParty);

module.exports = router;
