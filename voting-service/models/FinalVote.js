const mongoose = require('mongoose');

const finalVoteSchema = new mongoose.Schema(
  {
    voter: { type: mongoose.Schema.Types.ObjectId, required: true },
    party: { type: mongoose.Schema.Types.ObjectId, default: null },
    candidate: { type: mongoose.Schema.Types.ObjectId, default: null },
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

// One vote per voter overall
finalVoteSchema.index({ voter: 1 }, { unique: true });

module.exports = mongoose.model('FinalVote', finalVoteSchema);
