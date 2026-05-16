const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userEmail: { type: String },
    action: { type: String, required: true },
    status: { type: String, enum: ['success', 'rejected'], required: true },
    reason: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
    location: { type: String },
    details: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
