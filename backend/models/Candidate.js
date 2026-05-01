const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    photoUrl: { type: String, default: '' },
    referenceUrl: { type: String, trim: true, default: '' },
    // An independent candidate must not be a member or candidate of any political party.
    // Making party optional/null to support independent candidates.
    party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', default: null },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
