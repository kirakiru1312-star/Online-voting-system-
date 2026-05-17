import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ServiceUnavailable from '../../components/ServiceUnavailable';

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setServiceError(false);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      if (!err.response || err.response.status === 502 || err.response.status === 503) {
        setServiceError(true);
      }
      console.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return { color: '#991b1b', background: '#fee2e2', fontWeight: 800 };
      case 'WARNING': return { color: '#854d0e', background: '#fef9c3', fontWeight: 700 };
      default: return { color: '#1e293b', background: '#f1f5f9', fontWeight: 500 };
    }
  };

  const getStatusIcon = (status) => status === 'success' ? '✅' : '❌';

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1>Security Activity Log</h1>
          <p style={{ color: '#64748b' }}>Comprehensive audit trail of all system actions, authentication events, and voting attempts.</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-primary">Refresh Logs</button>
      </div>

      {loading ? <p>Loading activity logs...</p> : serviceError ? <ServiceUnavailable /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>Timestamp</th>
                  <th>User Identity</th>
                  <th>Action Type</th>
                  <th>Outcome</th>
                  <th>Network & Device</th>
                  <th>Severity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{log.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.userEmail}</div>
                      <small style={{ textTransform: 'uppercase', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800 }}>{log.user?.role || 'Guest'}</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.action}</div>
                      {log.reason && <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>Reason: {log.reason}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span title={log.status} style={{ fontSize: '1.1rem' }}>{getStatusIcon(log.status)}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}><strong>IP:</strong> {log.ipAddress}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem',
                        ...getSeverityStyle(log.severity)
                      }}>{log.severity}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{log.location || 'Unknown'}</div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No activity logs recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAuditLogs;
