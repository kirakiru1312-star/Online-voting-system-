const mongoose = require('mongoose');

const partyVoteSchema = new mongoose.Schema(
  {
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    nationalId: { type: String, required: true, unique: true },
    profession: { type: String, required: true },
    nationality: { type: String, required: true },
    region: { type: String, required: true },
    subCity: { type: String, required: true },
    kebele: { type: String, required: true },
  },
  { timestamps: true }
);

// Enforce one vote per voter for party voting (general)
partyVoteSchema.index({ voter: 1 }, { unique: true });

module.exports = mongoose.model('PartyVote', partyVoteSchema);
