import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ServiceUnavailable from '../components/ServiceUnavailable';



function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votingProgress, setVotingProgress] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [expandedCandidates, setExpandedCandidates] = useState({});
  const [electionServiceDown, setElectionServiceDown] = useState(false);
  const [votingServiceDown, setVotingServiceDown] = useState(false);

  const toggleCandidateExpand = (id) => {
    setExpandedCandidates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, voteCheckRes] = await Promise.allSettled([
          api.get('/candidates'),
          api.get('/votes/check')
        ]);
        if (candRes.status === 'fulfilled') setCandidates(candRes.value.data.filter(c => c.isActive));
        else setElectionServiceDown(true);
        if (voteCheckRes.status === 'fulfilled') setHasVoted(voteCheckRes.value.data.hasVoted);
        else setVotingServiceDown(true);
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVoteClick = (candidate) => {
    if (user?.role === 'admin') return toast.warning('Admin accounts cannot vote.');
    if (hasVoted) return toast.info('You have already cast your vote.');
    if (!candidate.election || candidate.election.status !== 'active') return toast.error('Election not active.');
    if (votingServiceDown) return toast.error('This service is temporarily unavailable at the moment. Please try again later.');
    setSelectedCandidate(candidate);
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
      await api.post('/candidates/vote', { candidateId: selectedCandidate._id });
      
      toast.success(`Success! You have voted for ${selectedCandidate.name}`);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '4px', height: '32px', background: '#ec4899', borderRadius: '2px' }}></div>
        <h1 style={{ marginBottom: 0 }}>Independent Candidates</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '3rem' }}>Browse independent candidates and confirm your choice for the upcoming election.</p>

      {loading ? (
        <p>Loading candidates...</p>
      ) : electionServiceDown ? (
        <ServiceUnavailable />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {candidates.map(candidate => {
            const isInactive = !candidate.election || candidate.election.status !== 'active' || candidate.election.type === 'party';
            const canVote = !hasVoted && !isInactive && user?.role !== 'admin';
            return (
              <div key={candidate._id} className="card" style={{ textAlign: 'center', transition: 'all 0.3s ease', border: '1px solid #f1f5f9', opacity: canVote ? 1 : 0.8, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ height: '100px', background: 'linear-gradient(90deg, #4f46e5 0%, #ec4899 100%)', margin: '-1.5rem -1.5rem 0 -1.5rem' }}></div>
                  {candidate.photoUrl ? (
                    <img src={getFullUrl(candidate.photoUrl)} alt={candidate.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginTop: '-60px', border: '5px solid white', boxShadow: 'var(--shadow-md)' }} />
                  ) : (
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '-60px', border: '5px solid white', fontSize: '3rem' }}>👤</div>
                  )}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{candidate.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{candidate.election?.title || 'No Election Assigned'}</p>
                
                <div style={{ marginBottom: '1.5rem', minHeight: expandedCandidates[candidate._id] ? 'auto' : '4rem' }}>
                  <p className={expandedCandidates[candidate._id] ? '' : 'text-clamp-3'} style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {candidate.bio || 'No biography available.'}
                  </p>
                  {candidate.bio && candidate.bio.length > 100 && (
                    <button onClick={() => toggleCandidateExpand(candidate._id)} style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {expandedCandidates[candidate._id] ? 'Show Less' : 'More...'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => candidate.referenceUrl && window.open(candidate.referenceUrl, '_blank')} 
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
                    <button onClick={() => handleVoteClick(candidate)} className="btn btn-primary" disabled={!canVote} style={{ width: '100%', padding: '1rem', background: canVote ? '#ec4899' : '#94a3b8' }}>
                      {hasVoted ? 'Vote Cast' : isInactive ? 'Election Closed' : user?.role === 'admin' ? 'Admin Restricted' : 'Elect Candidate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', textAlign: 'center', padding: '3rem' }}>
            {selectedCandidate.photoUrl && <img src={getFullUrl(selectedCandidate.photoUrl)} alt="photo" style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1.5rem', border: '3px solid #ec4899' }} />}
            <h2 style={{ marginBottom: '1rem' }}>Confirm Election Vote</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#475569' }}>
              {showOtpStep ? (
                <>
                  A verification code has been sent to <strong>{user.email}</strong>.<br/>
                  Please enter the 6-digit code below to confirm your identity.
                </>
              ) : (
                <>
                  Are you sure you want to vote for <br/><strong style={{ color: '#ec4899', fontSize: '1.4rem' }}>{selectedCandidate.name}</strong>?
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
                    border: '2px solid #ec4899',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={confirmVote} className="btn btn-primary" disabled={votingProgress} style={{ flex: 1, padding: '1rem', background: '#ec4899' }}>
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

export default CandidatesPage;
