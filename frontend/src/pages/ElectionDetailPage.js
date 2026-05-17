import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

function ElectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [elecRes, candRes, voteRes] = await Promise.allSettled([
        api.get(`/elections/${id}`),
        api.get(`/candidates?election=${id}`),
        api.get(`/votes/check/${id}`)
      ]);
      if (elecRes.status === 'fulfilled') setElection(elecRes.value.data);
      if (candRes.status === 'fulfilled') setCandidates(candRes.value.data);
      if (voteRes.status === 'fulfilled') setHasVoted(voteRes.value.data.hasVoted);
    } catch (err) {
      toast.error('Error loading election data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId) => {
    if (window.confirm('Confirm your vote? This cannot be undone.')) {
      setVoting(true);
      try {
        await api.post('/votes', { electionId: id, candidateId });
        toast.success('Vote cast successfully!');
        setHasVoted(true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Voting failed');
      } finally {
        setVoting(false);
      }
    }
  };

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${api.defaults.baseURL.replace('/api', '')}${path}`;
  };

  if (loading) return <div className="container"><p>Loading election...</p></div>;
  if (!election) return <div className="container"><p>Election not found.</p></div>;

  return (
    <div className="container">
      <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none' }}>
        <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>{election.title}</h1>
        <p style={{ opacity: 0.9 }}>{election.description}</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
          <span>📅 Starts: {new Date(election.startDate).toLocaleString()}</span>
          <span>🏁 Ends: {new Date(election.endDate).toLocaleString()}</span>
        </div>
      </div>

      {hasVoted ? (
        <div className="card" style={{ textAlign: 'center', border: '2px solid #22c55e', background: '#f0fdf4' }}>
          <span style={{ fontSize: '3rem' }}>✅</span>
          <h2 style={{ color: '#166534', marginTop: '1rem' }}>You have already voted!</h2>
          <p style={{ color: '#15803d' }}>Thank you for participating in this election.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/')}>
            Back to Elections
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <h2>Candidates</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please select one candidate to cast your vote.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {candidates.map(candidate => (
              <div key={candidate._id} className="card" style={{ position: 'relative', display: 'flex', gap: '1.5rem' }}>
                <div style={{ flexShrink: 0 }}>
                  <img 
                    src={getFullUrl(candidate.photoUrl) || 'https://via.placeholder.com/100'} 
                    alt={candidate.name} 
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9' }} 
                  />
                  <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                    <img 
                      src={getFullUrl(candidate.party?.logoUrl) || 'https://via.placeholder.com/30'} 
                      alt="party" 
                      style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} 
                    />
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{candidate.party?.abbreviation}</p>
                  </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{candidate.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>{candidate.bio}</p>
                  
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={voting || election.status !== 'active'}
                    onClick={() => handleVote(candidate._id)}
                  >
                    {voting ? 'Processing...' : election.status === 'active' ? 'Vote for Candidate' : 'Election Inactive'}
                  </button>
                </div>
              </div>
            ))}
            {candidates.length === 0 && <p>No candidates registered for this election.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ElectionDetailPage;
