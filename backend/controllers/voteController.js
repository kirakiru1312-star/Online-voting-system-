const { body } = require('express-validator');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const validate = require('../middleware/validate');

// @desc  Cast a vote (voter only)
// @route POST /api/votes
exports.castVote = [
  body('electionId').notEmpty().withMessage('Election ID is required'),
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  validate,
  async (req, res) => {
    try {
      const { electionId, candidateId } = req.body;

      // Check election is active
      const election = await Election.findById(electionId);
      if (!election) return res.status(404).json({ message: 'Election not found' });
      if (election.status !== 'active') {
        return res.status(400).json({ message: 'Election is not currently active' });
      }

      // Check if voter already voted in this election
      const existing = await Vote.findOne({ voter: req.user._id, election: electionId });
      if (existing) {
        return res.status(400).json({ message: 'You have already voted in this election' });
      }

      const vote = await Vote.create({
        voter: req.user._id,
        election: electionId,
        candidate: candidateId,
      });

      res.status(201).json({ message: 'Vote cast successfully', vote });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You have already voted in this election' });
      }
      res.status(500).json({ message: err.message });
    }
  },
];

// @desc  Check if current voter has voted in an election
// @route GET /api/votes/check/:electionId
exports.checkVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({ voter: req.user._id, election: req.params.electionId });
    res.json({ hasVoted: !!vote, vote: vote || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
