/**
 * Audit logger for election-service.
 * Sends audit log entries to auth-service (which owns db_auth / AuditLog collection).
 */
const axios = require('axios');

const logActivity = async ({ req, action, status, reason, severity, details }) => {
  try {
    const user = req?.user;
    // Fire-and-forget to auth-service internal log endpoint
    await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/internal/audit-log`, {
      userId: user?._id,
      userName: user?.name || 'Guest',
      userEmail: user?.email || 'N/A',
      action,
      status,
      reason,
      severity: severity || (status === 'rejected' ? 'WARNING' : 'INFO'),
      ipAddress: req?.ip || '0.0.0.0',
      userAgent: req?.headers?.['user-agent'] || 'Unknown',
      location: user?.region || 'Unknown',
      details
    });
  } catch (err) {
    console.error('[election-service] Audit log error:', err.message);
  }
};

module.exports = logActivity;
