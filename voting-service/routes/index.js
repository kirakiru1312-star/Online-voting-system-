const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const voteCtrl = require('../controllers/voteController');
const resultCtrl = require('../controllers/resultController');
const FinalVote = require('../models/FinalVote');
const VoteLog = require('../models/VoteLog');

// ── Vote casting ───────────────────────────────────────────
router.post('/parties/vote', protect, voteCtrl.voteForParty);
router.post('/candidates/vote', protect, voteCtrl.voteForCandidate);
router.get('/votes/check', protect, voteCtrl.checkVote);

// ── Results ────────────────────────────────────────────────
router.get('/results/:electionId', protect, resultCtrl.getResults);

// ── Admin tally & logs ─────────────────────────────────────
router.get('/admin/tally', protect, authorize('admin'), resultCtrl.getTally);
router.get('/admin/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await VoteLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
