const { body } = require('express-validator');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const FinalVote = require('../models/FinalVote');
const VoteLog = require('../models/VoteLog');
const User = require('../models/User');
const validate = require('../middleware/validate');

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
  body('party').notEmpty().withMessage('Party ID is required'),
  body('election').notEmpty().withMessage('Election ID is required'),
  validate,
  async (req, res) => {
    try {
      const { name, bio, party, election, referenceUrl } = req.body;
      let photoUrl = req.body.photoUrl;
      if (req.file) photoUrl = `/uploads/${req.file.filename}`;
      const candidate = await Candidate.create({ name, bio, photoUrl, referenceUrl, party, election, createdBy: req.user._id });
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
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
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
    const logDetails = { voter: req.user._id, ipAddress: req.ip, voteType: 'candidate', targetId: candidateId };

    try {
      if (req.user.role === 'admin') {
        await VoteLog.create({ ...logDetails, action: 'rejected', reason: 'Admin cannot vote' });
        return res.status(403).json({ message: 'Admin restricted.' });
      }

      const candidate = await Candidate.findById(candidateId).populate('election');
      if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });

      if (!candidate.election || candidate.election.status !== 'active') {
        return res.status(400).json({ message: 'Election not active.' });
      }

      const alreadyVoted = await FinalVote.findOne({ voter: req.user._id });
      if (alreadyVoted) return res.status(400).json({ message: 'Already voted.' });

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
      await VoteLog.create({ ...logDetails, action: 'success' });
      res.status(201).json({ message: 'Vote cast successfully!', vote });
    } catch (err) {
      await VoteLog.create({ ...logDetails, action: 'rejected', reason: err.message });
      res.status(500).json({ message: err.message });
    }
  },
];
