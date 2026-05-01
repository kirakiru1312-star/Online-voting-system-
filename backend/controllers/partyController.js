const { body } = require('express-validator');
const Party = require('../models/Party');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const FinalVote = require('../models/FinalVote');
const VoteLog = require('../models/VoteLog');
const User = require('../models/User');
const validate = require('../middleware/validate');

exports.getParties = async (req, res) => {
  try {
    const parties = await Party.find().populate('createdBy', 'name email');
    res.json(parties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getParty = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id).populate('createdBy', 'name email');
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createParty = [
  body('name').notEmpty().withMessage('Party name is required'),
  body('abbreviation').notEmpty().withMessage('Abbreviation is required'),
  validate,
  async (req, res) => {
    try {
      const { name, abbreviation, description, referenceUrl } = req.body;
      let logoUrl = req.body.logoUrl;
      if (req.file) logoUrl = `/uploads/${req.file.filename}`;
      const party = await Party.create({ name, abbreviation, description, logoUrl, referenceUrl, createdBy: req.user._id });
      res.status(201).json(party);
    } catch (err) {
      if (err.code === 11000) return res.status(400).json({ message: 'Party name already exists' });
      res.status(500).json({ message: err.message });
    }
  },
];

exports.updateParty = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.logoUrl = `/uploads/${req.file.filename}`;
    const party = await Party.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const candidatesCount = await Candidate.countDocuments({ party: req.params.id });
    if (candidatesCount > 0) return res.status(400).json({ message: 'Cannot delete party with registered candidates.' });
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json({ message: 'Party removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Vote for a party (Simplified: uses logged-in user info)
// @route POST /api/parties/vote
exports.voteForParty = [
  body('partyId').notEmpty().withMessage('Party ID is required'),
  validate,
  async (req, res) => {
    const { partyId } = req.body;
    const logDetails = { voter: req.user._id, ipAddress: req.ip, voteType: 'party', targetId: partyId };

    try {
      if (req.user.role === 'admin') {
        await VoteLog.create({ ...logDetails, action: 'rejected', reason: 'Admin cannot vote' });
        return res.status(403).json({ message: 'Admin accounts are not allowed to vote.' });
      }

      const activeElection = await Election.findOne({ status: 'active', type: { $in: ['party', 'both'] } });
      if (!activeElection) {
        await VoteLog.create({ ...logDetails, action: 'rejected', reason: 'No active party election' });
        return res.status(400).json({ message: 'Voting is not allowed at this time. No active party election found.' });
      }

      const alreadyVoted = await FinalVote.findOne({ voter: req.user._id });
      if (alreadyVoted) {
        await VoteLog.create({ ...logDetails, action: 'rejected', reason: 'User already voted' });
        return res.status(400).json({ message: 'You have already cast your vote.' });
      }

      // Create vote using user's profile data
      const vote = await FinalVote.create({
        voter: req.user._id,
        party: partyId,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        age: req.user.age,
        email: req.user.email,
        phone: req.user.phone,
        nationalId: req.user.nationalId,
        profession: req.user.profession,
        nationality: req.user.nationality,
        region: req.user.region,
        subCity: req.user.subCity,
        kebele: req.user.kebele,
        voteType: 'party'
      });

      // Mark user as voted
      await User.findByIdAndUpdate(req.user._id, { hasVoted: true, votedAt: new Date() });

      await VoteLog.create({ ...logDetails, action: 'success' });
      res.status(201).json({ message: 'Vote cast successfully!', vote });
    } catch (err) {
      await VoteLog.create({ ...logDetails, action: 'rejected', reason: err.message });
      res.status(500).json({ message: err.message });
    }
  },
];
