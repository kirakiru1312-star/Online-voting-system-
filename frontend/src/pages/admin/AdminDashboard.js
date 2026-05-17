import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState({
    parties: 0, elections: 0, candidates: 0,
    totalVoters: 0, totalVoted: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, e, c, s] = await Promise.allSettled([
          api.get('/parties'),
          api.get('/elections'),
          api.get('/candidates'),
          api.get('/admin/stats')
        ]);
        setStats({
          parties: p.status === 'fulfilled' ? p.value.data.length : 0,
          elections: e.status === 'fulfilled' ? e.value.data.length : 0,
          candidates: c.status === 'fulfilled' ? c.value.data.length : 0,
          totalVoters: s.status === 'fulfilled' ? s.value.data.totalVoters : 0,
          totalVoted: s.status === 'fulfilled' ? s.value.data.totalVoted : 0
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Welcome back, Admin. System monitoring and election controls are active.</p>
      </div>

      {/* Top Metrics Bar */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        color: 'white', border: 'none', marginBottom: '2rem', padding: '1.5rem 2.5rem' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Total Registered</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalVoters}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Votes Cast</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>{stats.totalVoted}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Participation Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              {stats.totalVoters > 0 ? ((stats.totalVoted / stats.totalVoters) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }}></div>
            <h3 style={{ margin: 0 }}>System Statistics</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span>Political Parties</span>
              <span style={{ fontWeight: 700 }}>{stats.parties}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span>Elections</span>
              <span style={{ fontWeight: 700 }}>{stats.elections}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <span>Independent Candidates</span>
              <span style={{ fontWeight: 700 }}>{stats.candidates}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <h3 style={{ margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <Link to="/admin/parties" className="card" style={{ textDecoration: 'none', padding: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Manage Parties &rarr;</h4>
            </Link>
            <Link to="/admin/elections" className="card" style={{ textDecoration: 'none', padding: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Manage Elections &rarr;</h4>
            </Link>
            <Link to="/admin/candidates" className="card" style={{ textDecoration: 'none', padding: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Manage Independent Candidates &rarr;</h4>
            </Link>
            <Link to="/admin/tally" className="card" style={{ textDecoration: 'none', padding: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>View Elected (Tally) &rarr;</h4>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '4px', height: '32px', background: '#ef4444', borderRadius: '2px' }}></div>
          <h2 style={{ marginBottom: 0 }}>Security & Audit</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <Link to="/admin/logs" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Security Activity Log</h3>
              <span style={{ fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>AUDIT ACTIVE</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Track logins, voting attempts, and administrative record changes with full IP and device data.
            </p>
            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>Access Complete Audit Trail &rarr;</div>
          </Link>
          
          <Link to="/admin/voters" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Voter Registry</h3>
              <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>PROTECTED</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Review registered citizen profiles and voting eligibility status. Passwords remain encrypted.
            </p>
            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>View Citizen Registry &rarr;</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
