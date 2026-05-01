const express = require('express');
const router = express.Router();
const FinalVote = require('../models/FinalVote');
const { protect } = require('../middleware/authMiddleware');

// @desc  Check if current user has already voted
// @route GET /api/votes/check
router.get('/check', protect, async (req, res) => {
  try {
    const vote = await FinalVote.findOne({ voter: req.user._id });
    res.json({ hasVoted: !!vote, voteType: vote ? vote.voteType : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
