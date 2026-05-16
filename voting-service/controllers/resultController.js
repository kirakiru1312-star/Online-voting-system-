const axios = require('axios');
const FinalVote = require('../models/FinalVote');
const mongoose = require('mongoose');

// GET /api/results/:electionId
exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Fetch election from election-service
    let election;
    try {
      const electionRes = await axios.get(`${process.env.ELECTION_SERVICE_URL}/api/elections/${electionId}`);
      election = electionRes.data;
    } catch (err) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Fetch candidates for this election from election-service
    let candidates = [];
    try {
      const candidatesRes = await axios.get(`${process.env.ELECTION_SERVICE_URL}/api/candidates?election=${electionId}`);
      candidates = candidatesRes.data;
    } catch (err) {
      candidates = [];
    }

    // Aggregate party votes for this election's parties
    const partyVotes = await FinalVote.aggregate([
      { $match: { voteType: 'party' } },
      { $group: { _id: '$party', count: { $sum: 1 } } }
    ]);

    // Aggregate candidate votes
    const candidateVoteAgg = await FinalVote.aggregate([
      { $match: { voteType: 'candidate' } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } }
    ]);

    const candidateCountMap = {};
    candidateVoteAgg.forEach((v) => { candidateCountMap[v._id.toString()] = v.count; });

    const totalVotes = candidateVoteAgg.reduce((sum, v) => sum + v.count, 0)
      + partyVotes.reduce((sum, v) => sum + v.count, 0);

    const results = candidates.map((c) => ({
      candidate: { id: c._id, name: c.name, photoUrl: c.photoUrl, party: c.party },
      votes: candidateCountMap[c._id.toString()] || 0,
      percentage: totalVotes > 0
        ? (((candidateCountMap[c._id.toString()] || 0) / totalVotes) * 100).toFixed(2)
        : '0.00'
    }));

    results.sort((a, b) => b.votes - a.votes);

    res.json({ election, totalVotes, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/tally  (admin vote tally)
exports.getTally = async (req, res) => {
  try {
    // Party tally
    const partyVotes = await FinalVote.aggregate([
      { $match: { voteType: 'party' } },
      { $group: { _id: '$party', count: { $sum: 1 } } }
    ]);

    // Candidate tally
    const candidateVotes = await FinalVote.aggregate([
      { $match: { voteType: 'candidate' } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } }
    ]);

    // Enrich with names from election-service
    let parties = [];
    let candidates = [];
    try {
      const [partiesRes, candidatesRes] = await Promise.all([
        axios.get(`${process.env.ELECTION_SERVICE_URL}/api/parties`),
        axios.get(`${process.env.ELECTION_SERVICE_URL}/api/candidates`)
      ]);
      parties = partiesRes.data;
      candidates = candidatesRes.data;
    } catch (err) { /* proceed with IDs only */ }

    const partyMap = {};
    parties.forEach((p) => { partyMap[p._id] = p; });

    const candidateMap = {};
    candidates.forEach((c) => { candidateMap[c._id] = c; });

    res.json({
      parties: partyVotes.map((p) => ({
        id: p._id,
        name: partyMap[p._id]?.name || 'Unknown Party',
        abbreviation: partyMap[p._id]?.abbreviation || '',
        logoUrl: partyMap[p._id]?.logoUrl,
        voteCount: p.count
      })),
      candidates: candidateVotes.map((c) => ({
        id: c._id,
        name: candidateMap[c._id]?.name || 'Unknown Candidate',
        photoUrl: candidateMap[c._id]?.photoUrl,
        partyName: candidateMap[c._id]?.party?.name || 'Independent',
        voteCount: c.count
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/logs  (vote logs)
exports.getVoteLogs = async (req, res) => {
  try {
    const { VoteLog } = require('../models/VoteLog');
    const logs = await VoteLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
