import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ServiceUnavailable from '../components/ServiceUnavailable';



function PartiesPage() {
  const { user } = useAuth();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [activeElection, setActiveElection] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [votingProgress, setVotingProgress] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [expandedParties, setExpandedParties] = useState({});
  const [electionServiceDown, setElectionServiceDown] = useState(false);
  const [votingServiceDown, setVotingServiceDown] = useState(false);

  const togglePartyExpand = (id) => {
    setExpandedParties(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partyRes, voteCheckRes, electionRes] = await Promise.allSettled([
          api.get('/parties'),
          api.get('/votes/check'),
          api.get('/elections')
        ]);
        if (partyRes.status === 'fulfilled') setParties(partyRes.value.data.filter(p => p.isActive));
        else setElectionServiceDown(true);
        if (voteCheckRes.status === 'fulfilled') setHasVoted(voteCheckRes.value.data.hasVoted);
        else setVotingServiceDown(true);
        if (electionRes.status === 'fulfilled') {
          const active = electionRes.value.data.find(e => e.status === 'active' && (e.type === 'party' || e.type === 'both'));
          setActiveElection(active);
        }
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVoteClick = (party) => {
    if (user?.role === 'admin') return toast.warning('Admin accounts cannot vote.');
    if (hasVoted) return toast.info('You have already cast your vote.');
    if (!activeElection) return toast.error('Voting is currently disabled.');
    if (votingServiceDown) return toast.error('This service is temporarily unavailable at the moment. Please try again later.');
    setSelectedParty(party);
    setShowConfirmModal(true);
    setShowOtpStep(false);
    setOtp('');
  };

  const handleRequestOtp = async () => {
    setVotingProgress(true);
    try {
      await api.post('/auth/request-otp', { email: user.email });
      toast.success('Verification code sent to your email.');
      setShowOtpStep(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setVotingProgress(false);
    }
  };

  const confirmVote = async () => {
    if (!showOtpStep) {
      return handleRequestOtp();
    }

    if (otp.length !== 6) {
      return toast.warning('Please enter the 6-digit code sent to your email.');
    }

    setVotingProgress(true);
    try {
      // 1. Verify OTP
      await api.post('/auth/verify-otp', { email: user.email, otp });
      
      // 2. Cast Vote
      await api.post('/parties/vote', { partyId: selectedParty._id });
      
      toast.success(`Success! You have voted for ${selectedParty.name}`);
      setHasVoted(true);
      setShowConfirmModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify or cast vote');
    } finally {
      setVotingProgress(false);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${api.defaults.baseURL.replace('/api', '')}${path}`;
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '4px', height: '32px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            <h1 style={{ marginBottom: 0 }}>Political Parties</h1>
          </div>
          <p style={{ color: '#64748b' }}>Select your preferred platform and confirm your election vote.</p>
        </div>
        {!loading && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 700, background: activeElection ? '#dcfce7' : '#fee2e2', color: activeElection ? '#166534' : '#991b1b' }}>
              {activeElection ? `● Election Active: ${activeElection.title}` : '● Voting Disabled'}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <p>Loading parties...</p>
      ) : electionServiceDown ? (
        <ServiceUnavailable />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {parties.map(party => (
            <div key={party._id} className="card" style={{ textAlign: 'center', transition: 'all 0.3s ease', border: '1px solid #f1f5f9', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', opacity: (hasVoted || !activeElection || user?.role === 'admin') ? 0.8 : 1, display: 'flex', flexDirection: 'column' }}>
              {party.logoUrl ? (
                <img src={getFullUrl(party.logoUrl)} alt={party.name} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', margin: '0 auto 1.5rem auto', boxShadow: 'var(--shadow-md)' }} />
              ) : (
                <div style={{ width: '120px', height: '120px', borderRadius: '20px', background: '#eef2ff', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '3rem' }}>🏛️</div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{party.name}</h3>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>{party.abbreviation}</p>
              
              <div style={{ marginBottom: '2rem' }}>
                <p className={expandedParties[party._id] ? '' : 'text-clamp-3'} style={{ color: '#64748b', fontSize: '1rem', minHeight: expandedParties[party._id] ? 'auto' : '4.5rem' }}>
                  {party.description || 'No description available.'}
                </p>
                {party.description && party.description.length > 120 && (
                  <button onClick={() => togglePartyExpand(party._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {expandedParties[party._id] ? 'Show Less' : 'More...'}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => party.referenceUrl && window.open(party.referenceUrl, '_blank')} 
                  className="btn" 
                  style={{ width: '100%', padding: '1rem', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
                >
                  Account Details
                </button>
                {votingServiceDown ? (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ color: '#c2410c', fontSize: '0.85rem', margin: 0 }}>
                      This service is temporarily unavailable at the moment. Please try again later.
                    </p>
                  </div>
                ) : (
                  <button onClick={() => handleVoteClick(party)} className="btn btn-primary" disabled={hasVoted || !activeElection || user?.role === 'admin'} style={{ width: '100%', padding: '1rem', background: (hasVoted || !activeElection || user?.role === 'admin') ? '#94a3b8' : 'var(--primary)' }}>
                    {hasVoted ? 'Vote Cast' : !activeElection ? 'Election Closed' : user?.role === 'admin' ? 'Admin Restricted' : 'Elect the Party'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', textAlign: 'center', padding: '3rem' }}>
            {selectedParty.logoUrl && <img src={getFullUrl(selectedParty.logoUrl)} alt="logo" style={{ width: '80px', height: '80px', borderRadius: '15px', marginBottom: '1.5rem' }} />}
            <h2 style={{ marginBottom: '1rem' }}>Confirm Election Vote</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#475569' }}>
              {showOtpStep ? (
                <>
                  A verification code has been sent to <strong>{user.email}</strong>.<br/>
                  Please enter the 6-digit code below to confirm your identity.
                </>
              ) : (
                <>
                  Are you sure you want to vote for <br/><strong style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{selectedParty.name}</strong>?
                </>
              )}
            </p>

            {showOtpStep && (
              <div style={{ marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.5rem',
                    borderRadius: '12px',
                    border: '2px solid var(--primary)',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={confirmVote} className="btn btn-primary" disabled={votingProgress} style={{ flex: 1, padding: '1rem' }}>
                {votingProgress ? (showOtpStep ? 'Verifying...' : 'Sending...') : (showOtpStep ? 'Verify & Confirm Vote' : 'Yes, Send Verification Code')}
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="btn" disabled={votingProgress} style={{ flex: 1, background: '#f1f5f9', color: '#475569', padding: '1rem' }}>
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartiesPage;
