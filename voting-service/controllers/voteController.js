const { body } = require('express-validator');
const axios = require('axios');
const FinalVote = require('../models/FinalVote');
const VoteLog = require('../models/VoteLog');
const validate = require('../middleware/validate');

// Helper: fetch election from election-service
const getElection = async (electionId) => {
  const res = await axios.get(`${process.env.ELECTION_SERVICE_URL}/api/elections/${electionId}`);
  return res.data;
};

// Helper: fetch candidate from election-service
const getCandidate = async (candidateId) => {
  const res = await axios.get(`${process.env.ELECTION_SERVICE_URL}/api/candidates/${candidateId}`);
  return res.data;
};

// Helper: notify auth-service to mark user as voted
const markUserVoted = async (userId) => {
  await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/internal/mark-voted`, { userId });
};

// Helper: send audit log to auth-service
const sendAuditLog = async ({ req, action, status, reason, severity, details }) => {
  try {
    const user = req?.user;
    await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/internal/audit-log`, {
      userId: user?._id,
      userName: user?.name || 'Guest',
      userEmail: user?.email || 'N/A',
      action, status, reason,
      severity: severity || (status === 'rejected' ? 'WARNING' : 'INFO'),
      ipAddress: req?.ip || '0.0.0.0',
      userAgent: req?.headers?.['user-agent'] || 'Unknown',
      location: user?.region || 'Unknown',
      details
    });
  } catch (err) {
    console.error('[voting-service] Audit log error:', err.message);
  }
};

// POST /api/parties/vote
exports.voteForParty = [
  body('partyId').notEmpty().withMessage('Party ID is required'),
  validate,
  async (req, res) => {
    const { partyId } = req.body;
    try {
      if (req.user.role === 'admin') {
        await sendAuditLog({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: 'Admin cannot vote', severity: 'CRITICAL' });
        return res.status(403).json({ message: 'Admin accounts are not allowed to vote.' });
      }

      // Check active election via election-service
      let activeElection;
      try {
        const electionsRes = await axios.get(`${process.env.ELECTION_SERVICE_URL}/api/elections`);
        activeElection = electionsRes.data.find(
          (e) => e.status === 'active' && (e.type === 'party' || e.type === 'both')
        );
      } catch (err) {
        return res.status(500).json({ message: 'Could not reach election service.' });
      }

      if (!activeElection) {
        await sendAuditLog({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: 'No active election', severity: 'WARNING' });
        return res.status(400).json({ message: 'Voting is not allowed at this time. No active party election found.' });
      }

      const alreadyVoted = await FinalVote.findOne({ voter: req.user._id });
      if (alreadyVoted) {
        await sendAuditLog({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: 'Duplicate Vote Attempt', severity: 'CRITICAL' });
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

      // Log vote attempt
      await VoteLog.create({
        voter: req.user._id,
        ipAddress: req.ip,
        action: 'success',
        voteType: 'party',
        targetId: partyId
      });

      // Notify auth-service to mark user as voted
      await markUserVoted(req.user._id);

      await sendAuditLog({ req, action: 'Vote Cast (Party)', status: 'success', severity: 'INFO', details: { partyId } });
      res.status(201).json({ message: 'Vote cast successfully!', vote });
    } catch (err) {
      await VoteLog.create({ voter: req.user?._id, ipAddress: req.ip, action: 'rejected', reason: err.message, voteType: 'party' }).catch(() => {});
      await sendAuditLog({ req, action: 'Vote Cast (Party)', status: 'rejected', reason: err.message, severity: 'CRITICAL' });
      res.status(500).json({ message: err.message });
    }
  }
];

// POST /api/candidates/vote
exports.voteForCandidate = [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  validate,
  async (req, res) => {
    const { candidateId } = req.body;
    try {
      if (req.user.role === 'admin') {
        await sendAuditLog({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: 'Admin cannot vote', severity: 'CRITICAL' });
        return res.status(403).json({ message: 'Admin accounts are not allowed to vote.' });
      }

      // Fetch candidate + its election from election-service
      let candidate;
      try {
        candidate = await getCandidate(candidateId);
      } catch (err) {
        return res.status(404).json({ message: 'Candidate not found.' });
      }

      if (!candidate.election || candidate.election.status !== 'active' || candidate.election.type === 'party') {
        await sendAuditLog({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: 'Election not active or independent candidates disabled', severity: 'WARNING' });
        return res.status(400).json({ message: 'Independent candidates are not participating in this election.' });
      }

      const alreadyVoted = await FinalVote.findOne({ voter: req.user._id });
      if (alreadyVoted) {
        await sendAuditLog({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: 'Duplicate Vote Attempt', severity: 'CRITICAL' });
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

      await VoteLog.create({
        voter: req.user._id,
        ipAddress: req.ip,
        action: 'success',
        voteType: 'candidate',
        targetId: candidateId
      });

      await markUserVoted(req.user._id);

      await sendAuditLog({ req, action: 'Vote Cast (Candidate)', status: 'success', severity: 'INFO', details: { candidateId } });
      res.status(201).json({ message: 'Vote cast successfully!', vote });
    } catch (err) {
      await VoteLog.create({ voter: req.user?._id, ipAddress: req.ip, action: 'rejected', reason: err.message, voteType: 'candidate' }).catch(() => {});
      await sendAuditLog({ req, action: 'Vote Cast (Candidate)', status: 'rejected', reason: err.message, severity: 'CRITICAL' });
      res.status(500).json({ message: err.message });
    }
  }
];

// GET /api/votes/check
exports.checkVote = async (req, res) => {
  try {
    const vote = await FinalVote.findOne({ voter: req.user._id });
    res.json({ hasVoted: !!vote, voteType: vote ? vote.voteType : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
