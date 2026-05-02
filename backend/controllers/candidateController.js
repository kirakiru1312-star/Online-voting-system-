const { body } = require('express-validator');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const FinalVote = require('../models/FinalVote');
const User = require('../models/User');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/logger');

exports.getCandidates = async (req, res) => {
  try {
    const filter = req.query.election ? { election: req.query.election } : {};
    const candidates = await Candidate.find(filter).populate('party', 'name abbreviation logoUrl').populate('election', 'title status type');
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('party', 'name abbreviation logoUrl').populate('election', 'title status type');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCandidate = [
  body('name').notEmpty().withMessage('Name is required'),
  body('election').notEmpty().withMessage('Election ID is required'),
  validate,
  async (req, res) => {
    try {
      const { name, bio, election, referenceUrl } = req.body;
      let photoUrl = req.body.photoUrl;
      if (req.file) photoUrl = `/uploads/${req.file.filename}`;
      const candidate = await Candidate.create({ name, bio, photoUrl, referenceUrl, party: null, election, createdBy: req.user._id });
      
      await logActivity({ req, action: 'Candidate Registration', status: 'success', details: { candidateName: name } });
      
      res.status(201).json(candidate);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
];

exports.updateCandidate = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.photoUrl = `/uploads/${req.file.filename}`;
    if (updateData.party === '') updateData.party = null;
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    await logActivity({ req, action: 'Candidate Update', status: 'success', details: { candidateId: candidate._id } });
    
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    await logActivity({ req, action: 'Candidate Removal', status: 'success', severity: 'WARNING', details: { candidateName: candidate.name } });
    
    res.json({ message: 'Candidate removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.voteForCandidate = [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  validate,
  async (req, res) => {
    const { candidateId } = req.body;
    try {
      if (req.user.role === 'admin') {
        await logActivity({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: 'Admin cannot vote', severity: 'CRITICAL' });
        return res.status(403).json({ message: 'Admin accounts are not allowed to vote.' });
      }

      const candidate = await Candidate.findById(candidateId).populate('election');
      if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });

      if (!candidate.election || candidate.election.status !== 'active' || candidate.election.type === 'party') {
        await logActivity({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: 'Election not active or independent candidates disabled', severity: 'WARNING' });
        return res.status(400).json({ message: 'Independent candidates are not participating in this election.' });
      }

      const alreadyVoted = await FinalVote.findOne({ voter: req.user._id });
      if (alreadyVoted) {
        await logActivity({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: 'Duplicate Vote Attempt', severity: 'CRITICAL' });
        return res.status(400).json({ message: 'You have already cast your vote.' });
      }

      const vote = await FinalVote.create({
        voter: req.user._id,
        candidate: candidateId,
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
        voteType: 'candidate'
      });

      await User.findByIdAndUpdate(req.user._id, { hasVoted: true, votedAt: new Date() });
      await logActivity({ req, action: 'Vote Cast (Candidate)', status: 'success', severity: 'INFO', details: { candidateId } });
      
      res.status(201).json({ message: 'Vote cast successfully!', vote });
    } catch (err) {
      await logActivity({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: err.message, severity: 'CRITICAL' });
      res.status(500).json({ message: err.message });
    }
  },
];
