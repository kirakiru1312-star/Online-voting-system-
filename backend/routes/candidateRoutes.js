const express = require('express');
const router = express.Router();
const { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate, voteForCandidate } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getCandidates);
router.post('/vote', protect, voteForCandidate);
router.get('/:id', getCandidate);
router.post('/', protect, authorize('admin'), upload.single('photo'), createCandidate);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), updateCandidate);
router.delete('/:id', protect, authorize('admin'), deleteCandidate);

module.exports = router;
