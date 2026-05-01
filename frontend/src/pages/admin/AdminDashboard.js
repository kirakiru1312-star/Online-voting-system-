import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState({
    parties: 0, elections: 0, candidates: 0,
    totalVoters: 0, totalVoted: 0
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, e, c, l, s] = await Promise.all([
          api.get('/parties'),
          api.get('/elections'),
          api.get('/candidates'),
          api.get('/admin/logs'),
          api.get('/admin/stats')
        ]);
        setStats({
          parties: p.data.length,
          elections: e.data.length,
          candidates: c.data.length,
          totalVoters: s.data.totalVoters,
          totalVoted: s.data.totalVoted
        });
        setLogs(l.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: '#64748b' }}>Welcome back! Here is an overview of the system.</p>
        </div>
        <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '2rem', background: '#f8fafc', border: '1px solid var(--primary)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Registered Voters</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalVoters}</div>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Voted</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e' }}>{stats.totalVoted}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>🏳️</span>
          <h3 style={{ marginTop: '1rem' }}>{stats.parties}</h3>
          <p style={{ color: '#64748b' }}>Political Parties</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>🗳️</span>
          <h3 style={{ marginTop: '1rem' }}>{stats.elections}</h3>
          <p style={{ color: '#64748b' }}>Elections</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>👥</span>
          <h3 style={{ marginTop: '1rem' }}>{stats.candidates}</h3>
          <p style={{ color: '#64748b' }}>Candidates</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <h2>Security Activity Log</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Voter</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Action</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{log.voter?.name || 'Guest'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{log.ipAddress}</div>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{log.voteType} {log.action}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800,
                        background: log.action === 'success' ? '#dcfce7' : '#fee2e2',
                        color: log.action === 'success' ? '#166534' : '#991b1b'
                      }}>{log.action.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/admin/parties" className="card" style={{ textDecoration: 'none' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Manage Parties &rarr;</h4>
            </Link>
            <Link to="/admin/elections" className="card" style={{ textDecoration: 'none' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Manage Elections &rarr;</h4>
            </Link>
            <Link to="/admin/candidates" className="card" style={{ textDecoration: 'none' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Manage Candidates &rarr;</h4>
            </Link>
            <Link to="/admin/tally" className="card" style={{ textDecoration: 'none' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>View Elected (Tally) &rarr;</h4>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
