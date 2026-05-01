const AuditLog = require('../models/AuditLog');

const logActivity = async ({ req, user, action, status, reason, severity, details }) => {
  try {
    const activeUser = user || req?.user;
    await AuditLog.create({
      user: activeUser?._id,
      userName: activeUser?.name || 'Guest',
      userEmail: activeUser?.email || 'N/A',
      action,
      status,
      reason,
      severity: severity || (status === 'rejected' ? 'WARNING' : 'INFO'),
      ipAddress: req?.ip || '0.0.0.0',
      userAgent: req?.headers['user-agent'] || 'Unknown',
      location: activeUser?.region || 'Unknown',
      details
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

module.exports = logActivity;
