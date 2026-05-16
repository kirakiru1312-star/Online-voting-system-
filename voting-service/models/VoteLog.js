const mongoose = require('mongoose');

const voteLogSchema = new mongoose.Schema(
  {
    voter: { type: mongoose.Schema.Types.ObjectId },
    ipAddress: { type: String },
    action: { type: String, enum: ['attempt', 'success', 'rejected'], required: true },
    reason: { type: String },
    voteType: { type: String, enum: ['party', 'candidate'] },
    targetId: { type: String },
    details: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.model('VoteLog', voteLogSchema);
