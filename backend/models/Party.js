const mongoose = require('mongoose');

const partySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    abbreviation: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String, default: '' },
    referenceUrl: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Party', partySchema);
