import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [voterStats, setVoterStats] = useState({ total: 0, voted: 0 });

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchStats = async () => {
        try {
          const res = await api.get('/admin/stats');
          setVoterStats({ total: res.data.totalVoters, voted: res.data.totalVoted });
        } catch (err) {
          console.error('Failed to fetch navbar stats');
        }
      };
      fetchStats();
      const interval = setInterval(fetchStats, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🗳️ VoteSystem</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            {user.role === 'admin' && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/parties">Parties</Link>
                <Link to="/admin/elections">Elections</Link>
                <Link to="/admin/candidates">Candidates</Link>
                
                {/* Voter Stats Navigation Item */}
                <div className="nav-stats" style={{ 
                  display: 'flex', gap: '1rem', background: '#f1f5f9', 
                  padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.75rem',
                  marginLeft: '1rem', border: '1px solid #e2e8f0'
                }}>
                  <div title="Registered Voters">👥 {voterStats.total}</div>
                  <div style={{ color: '#cbd5e1' }}>|</div>
                  <div title="Voted Voters" style={{ color: '#22c55e', fontWeight: 700 }}>✅ {voterStats.voted}</div>
                </div>
              </>
            )}
            {user.role === 'voter' && (
              <>
                <Link to="/parties">Political Parties</Link>
                <Link to="/candidates">Candidates</Link>
              </>
            )}
            <span className="navbar-user">👤 {user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
