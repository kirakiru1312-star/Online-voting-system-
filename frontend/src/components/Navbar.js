import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [voterStats, setVoterStats] = useState({ total: 0, voted: 0 });
  const [showVotingRules, setShowVotingRules] = useState(false);

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
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to={user?.role === 'admin' ? '/admin/system' : '/'}>🗳️ VoteSystem</Link>
          <button
            onClick={() => setShowVotingRules(true)}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#4f46e5',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            📋 Voting Rules
          </button>
        </div>
        <div className="navbar-links">
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin">Dashboard</Link>
                  <Link to="/admin/parties">Parties</Link>
                  <Link to="/admin/elections">Elections</Link>
                  <Link to="/admin/candidates">Independent Candidates</Link>
                  <Link to="/admin/messages">Messages</Link>
                  
                  {/* Voter Stats Navigation Item */}
                  <Link to="/admin/voters" className="nav-stats" style={{ 
                    display: 'flex', gap: '1rem', background: '#f1f5f9', 
                    padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.75rem',
                    marginLeft: '1rem', border: '1px solid #e2e8f0', textDecoration: 'none',
                    color: 'inherit', cursor: 'pointer'
                  }}>
                    <div title="Registered Voters">👥 {voterStats.total}</div>
                    <div style={{ color: '#cbd5e1' }}>|</div>
                    <div title="Voted Voters" style={{ color: '#22c55e', fontWeight: 700 }}>✅ {voterStats.voted}</div>
                  </Link>
                </>
              )}
              {user.role === 'voter' && (
                <>
                  <Link to="/parties">Political Parties</Link>
                  <Link to="/candidates">Independent Candidates</Link>
                  <Link to="/contact">Contact Us</Link>
                </>
              )}
              {user.role === 'voter' ? (
                <button
                  className="navbar-user"
                  onClick={() => navigate('/profile')}
                  style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}
                >
                  👤 {user.name}
                </button>
              ) : (
                <span className="navbar-user">👤 {user.name}</span>
              )}
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/contact">Contact Us</Link>
            </>
          )}
        </div>
      </nav>

      {/* Voting Rules Modal */}
      {showVotingRules && (
        <div
          onClick={() => setShowVotingRules(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 2000, backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '16px', maxWidth: '720px',
              width: '95%', maxHeight: '85vh', overflowY: 'auto',
              padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📋 Voting Rules / የምርጫ ደንቦች
              </h2>
              <button
                onClick={() => setShowVotingRules(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#475569' }}
              >
                ✕
              </button>
            </div>

            {/* ── AMHARIC SECTION ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                አማርኛ
              </h3>

              {/* Intro */}
              <p style={{ color: '#334155', lineHeight: '1.8', marginBottom: '1.25rem' }}>
                ይህ የብሔራዊ ኦንላይን ምርጫ ሥርዓት በሕግ እና በደንብ የሚመራ ነው። እያንዳንዱ መራጭ የሚከተሉትን ደንቦች የማክበር ግዴታ አለበት፦
              </p>

              {/* Rule 1 – yellow highlight */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>ሕጋዊ ተገዥነት፦</p>
                <p style={{ background: '#fef9c3', color: '#713f12', lineHeight: '1.8', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
                  ማንኛውም መራጭ የምርጫ ደንቦችን የማክበር ግዴታ አለበት። ከደንብ ውጭ የሚደረጉ ሕገ-ወጥ ድርጊቶች በምርጫ ሥርዓቱ ላይ ጉዳት የሚያስከትሉ በመሆናቸው፣ በሕገ-መንግሥቱ መሠረት በሕግ ያስጠይቃሉ።
                </p>
              </div>

              {/* Rule 2 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>የዕድሜ እና የሥራ ሁኔታ፦</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  ድምፅ ለመስጠት ዕድሜዎ 18 ዓመት እና ከዚያ በላይ መሆን አለበት። እንዲሁም የመከላከያ ሠራዊት (ወታደር) አባል መሆን የለብዎትም።
                </p>
              </div>

              {/* Rule 3 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>የመረጃ ትክክለኛነት፦</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  በምዝገባ ወቅትም ሆነ መረጃ በሚያድሱበት ጊዜ ሁሉንም አስፈላጊ መረጃዎች በትክክል መሙላት ግዴታ ነው።
                </p>
              </div>

              {/* Rule 4 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>የድምፅ አሰጣጥ መብት፦</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  አንድ መራጭ አንድ የድምፅ ዕድል ብቻ አለው። ይህም ለአንድ የፖለቲካ ፓርቲ ወይም ለአንድ እጩ ተወዳዳሪ ብቻ ይሆናል።
                </p>
              </div>

              {/* Rule 5 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>መረጃን ስለማስተካከል፦</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  መረጃዎን ማስተካከል የሚችሉት ድምፅ ከመስጠትዎ በፊት ብቻ ነው። አንዴ ድምፅ ከሰጡ በኋላ መረጃዎን መቀየር ወይም ማስተካከል አይችሉም።
                </p>
              </div>

              {/* Closing */}
              <p style={{ fontStyle: 'italic', fontWeight: 700, color: '#4f46e5', textAlign: 'center', fontSize: '1rem' }}>
                "ደንቦቹን በማክበር ለፍትሃዊ ምርጫ የበኩሎን ይወጡ!"
              </p>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', marginBottom: '2.5rem' }} />

            {/* ── ENGLISH SECTION ── */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                Voting Rules and Regulations
              </h3>

              {/* Intro */}
              <p style={{ color: '#334155', lineHeight: '1.8', marginBottom: '1.25rem' }}>
                This National Online Voting System operates under strict legal guidelines. Every voter is required to adhere to the following rules:
              </p>

              {/* Rule 1 – yellow highlight */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Legal Compliance:</p>
                <p style={{ background: '#fef9c3', color: '#713f12', lineHeight: '1.8', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
                  Voters must strictly follow all voting regulations. Any illegal actions or attempts to compromise the voting system are strictly prohibited and will lead to accountability under the constitution and relevant laws.
                </p>
              </div>

              {/* Rule 2 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Eligibility Criteria:</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  You must be at least 18 years of age to vote. Active members of the military (soldiers) are not eligible to participate.
                </p>
              </div>

              {/* Rule 3 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Data Accuracy:</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  It is mandatory to provide complete and accurate information during registration and any subsequent profile updates.
                </p>
              </div>

              {/* Rule 4 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>One Person, One Vote:</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  Each registered voter is entitled to only one vote, cast for either a political party or an individual candidate.
                </p>
              </div>

              {/* Rule 5 */}
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Post-Voting Restriction:</p>
                <p style={{ color: '#334155', lineHeight: '1.8' }}>
                  Profile updates are permitted only before voting. Once a vote is cast, profile information becomes locked and cannot be changed.
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowVotingRules(false)}
              style={{
                width: '100%', padding: '0.875rem', background: '#4f46e5', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
