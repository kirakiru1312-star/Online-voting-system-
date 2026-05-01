const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// @desc  Get results for a specific election
// @route GET /api/results/:electionId
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const candidates = await Candidate.find({ election: req.params.electionId })
      .populate('party', 'name abbreviation logoUrl');

    // Aggregate vote counts per candidate
    const voteCounts = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: '$candidate', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    voteCounts.forEach((v) => { countMap[v._id.toString()] = v.count; });

    const totalVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

    const results = candidates.map((c) => ({
      candidate: { id: c._id, name: c.name, photoUrl: c.photoUrl, party: c.party },
      votes: countMap[c._id.toString()] || 0,
      percentage: totalVotes > 0 ? (((countMap[c._id.toString()] || 0) / totalVotes) * 100).toFixed(2) : '0.00',
    }));

    results.sort((a, b) => b.votes - a.votes);

    res.json({ election, totalVotes, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
