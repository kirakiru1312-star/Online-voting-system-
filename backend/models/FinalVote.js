const mongoose = require('mongoose');

const finalVoteSchema = new mongoose.Schema(
  {
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    nationalId: { type: String, required: true },
    profession: { type: String, required: true },
    nationality: { type: String, required: true },
    region: { type: String, required: true },
    subCity: { type: String, required: true },
    kebele: { type: String, required: true },
    voteType: { type: String, enum: ['party', 'candidate'], required: true }
  },
  { timestamps: true }
);

// Enforce one vote per voter overall
// This is the critical constraint that prevents multiple voting.
finalVoteSchema.index({ voter: 1 }, { unique: true });

module.exports = mongoose.model('FinalVote', finalVoteSchema);
