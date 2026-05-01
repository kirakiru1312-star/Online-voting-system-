const { body } = require('express-validator');
const Party = require('../models/Party');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const FinalVote = require('../models/FinalVote');
const User = require('../models/User');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/logger');

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
      
      await logActivity({ req, action: 'Party Creation', status: 'success', severity: 'INFO', details: { partyName: name } });
      
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
    
    await logActivity({ req, action: 'Party Update', status: 'success', details: { partyId: party._id } });
    
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const candidatesCount = await Candidate.countDocuments({ party: req.params.id });
    if (candidatesCount > 0) {
      await logActivity({ req, action: 'Party Deletion', status: 'rejected', reason: 'Has candidates', severity: 'WARNING' });
      return res.status(400).json({ message: 'Cannot delete party with registered candidates.' });
    }
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    
    await logActivity({ req, action: 'Party Deletion', status: 'success', severity: 'WARNING', details: { partyName: party.name } });
    
    res.json({ message: 'Party removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.voteForParty = [
  body('partyId').notEmpty().withMessage('Party ID is required'),
  validate,
  async (req, res) => {
    const { partyId } = req.body;
    try {
      if (req.user.role === 'admin') {
        await logActivity({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: 'Admin cannot vote', severity: 'CRITICAL' });
        return res.status(403).json({ message: 'Admin accounts are not allowed to vote.' });
      }

      const activeElection = await Election.findOne({ status: 'active', type: { $in: ['party', 'both'] } });
      if (!activeElection) {
        await logActivity({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: 'No active election', severity: 'WARNING' });
        return res.status(400).json({ message: 'Voting is not allowed at this time. No active party election found.' });
      }

      const alreadyVoted = await FinalVote.findOne({ voter: req.user._id });
      if (alreadyVoted) {
        await logActivity({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: 'Duplicate Vote Attempt', severity: 'CRITICAL' });
        return res.status(400).json({ message: 'You have already cast your vote.' });
      }

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

      await User.findByIdAndUpdate(req.user._id, { hasVoted: true, votedAt: new Date() });
      await logActivity({ req, action: 'Vote Cast (Party)', status: 'success', severity: 'INFO', details: { partyId } });
      
      res.status(201).json({ message: 'Vote cast successfully!', vote });
    } catch (err) {
      await logActivity({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: err.message, severity: 'CRITICAL' });
      res.status(500).json({ message: err.message });
    }
  },
];
