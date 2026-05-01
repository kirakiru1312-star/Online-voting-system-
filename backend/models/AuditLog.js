const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userEmail: { type: String },
    action: { type: String, required: true }, // e.g., 'Login', 'Vote Cast', 'Election Created'
    status: { type: String, enum: ['success', 'rejected'], required: true },
    reason: { type: String }, // For failures
    ipAddress: { type: String },
    userAgent: { type: String }, // Browser/OS info
    severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
    location: { type: String }, // e.g., 'Addis Ababa'
    details: { type: Object } // Extra metadata
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
