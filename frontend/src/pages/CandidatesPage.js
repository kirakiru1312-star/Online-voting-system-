import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const BioCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = text && text.length > 100;
  return (
    <div style={{ marginBottom: '1.5rem', minHeight: expanded ? 'auto' : '4rem' }}>
      <p className={expanded ? '' : 'text-clamp-3'} style={{ color: '#64748b', fontSize: '0.9rem' }}>
        {text || 'No biography available.'}
      </p>
      {needsExpansion && (
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.8rem', marginTop: '0.25rem' }}>
          {expanded ? 'Show Less' : 'More...'}
        </button>
      )}
    </div>
  );
};

function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votingProgress, setVotingProgress] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, voteCheckRes] = await Promise.all([
          api.get('/candidates'),
          api.get('/votes/check')
        ]);
        setCandidates(candRes.data.filter(c => c.isActive));
        setHasVoted(voteCheckRes.data.hasVoted);
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
    setSelectedCandidate(candidate);
    setShowConfirmModal(true);
  };

  const confirmVote = async () => {
    setVotingProgress(true);
    try {
      await api.post('/candidates/vote', { candidateId: selectedCandidate._id });
      toast.success(`Success! You have voted for ${selectedCandidate.name}`);
      setHasVoted(true);
      setShowConfirmModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
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
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {candidates.map(candidate => {
            const isInactive = !candidate.election || candidate.election.status !== 'active';
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
                <BioCell text={candidate.bio} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                  <button onClick={() => handleVoteClick(candidate)} className="btn btn-primary" disabled={!canVote} style={{ width: '100%', padding: '1rem', background: canVote ? '#ec4899' : '#94a3b8' }}>
                    {hasVoted ? 'Vote Cast' : isInactive ? 'Voting Closed' : user?.role === 'admin' ? 'Admin Restricted' : 'Elect Candidate'}
                  </button>
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
              Are you sure you want to vote for <br/><strong style={{ color: '#ec4899', fontSize: '1.4rem' }}>{selectedCandidate.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={confirmVote} className="btn btn-primary" disabled={votingProgress} style={{ flex: 1, padding: '1rem', background: '#ec4899' }}>
                {votingProgress ? 'Voting...' : 'Yes, Confirm'}
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
