const mongoose = require('mongoose');

const voteLogSchema = new mongoose.Schema(
  {
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    action: { type: String, enum: ['attempt', 'success', 'rejected'], required: true },
    reason: { type: String }, // For rejected attempts
    voteType: { type: String, enum: ['party', 'candidate'] },
    targetId: { type: String }, // Party ID or Candidate ID
    details: { type: Object } // Store form data snippets if needed for audit
  },
  { timestamps: true }
);

module.exports = mongoose.model('VoteLog', voteLogSchema);
