const express = require('express');
const router = express.Router();
const VoteLog = require('../models/VoteLog');
const User = require('../models/User');
const FinalVote = require('../models/FinalVote');
const Party = require('../models/Party');
const Candidate = require('../models/Candidate');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc  Get admin dashboard stats
// @route GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalVoted = await User.countDocuments({ hasVoted: true });
    res.json({ totalVoters, totalVoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc  Get live vote tallies for parties and candidates
// @route GET /api/admin/tally
router.get('/tally', protect, authorize('admin'), async (req, res) => {
  try {
    // 1. Get Party Votes
    const partyVotes = await FinalVote.aggregate([
      { $match: { voteType: 'party' } },
      { $group: { _id: '$party', count: { $sum: 1 } } }
    ]);
    const populatedParties = await Party.populate(partyVotes, { path: '_id', select: 'name abbreviation logoUrl' });

    // 2. Get Candidate Votes
    const candidateVotes = await FinalVote.aggregate([
      { $match: { voteType: 'candidate' } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } }
    ]);
    const populatedCandidates = await Candidate.populate(candidateVotes, { path: '_id', select: 'name photoUrl party' });
    const populatedCandidatesWithParty = await Party.populate(populatedCandidates, { path: '_id.party', select: 'name' });

    res.json({
      parties: populatedParties.map(p => ({
        id: p._id?._id,
        name: p._id?.name || 'Unknown Party',
        abbreviation: p._id?.abbreviation || '',
        logoUrl: p._id?.logoUrl,
        voteCount: p.count
      })),
      candidates: populatedCandidatesWithParty.map(c => ({
        id: c._id?._id,
        name: c._id?.name || 'Unknown Candidate',
        photoUrl: c._id?.photoUrl,
        partyName: c._id?.party?.name || 'Independent',
        voteCount: c.count
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await VoteLog.find().populate('voter', 'name email').sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
