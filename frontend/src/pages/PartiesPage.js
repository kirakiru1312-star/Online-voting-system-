import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const DescriptionCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = text && text.length > 120;
  return (
    <div style={{ marginBottom: '2rem' }}>
      <p className={expanded ? '' : 'text-clamp-3'} style={{ color: '#64748b', fontSize: '1rem', minHeight: expanded ? 'auto' : '4.5rem' }}>
        {text || 'No description available.'}
      </p>
      {needsExpansion && (
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {expanded ? 'Show Less' : 'More...'}
        </button>
      )}
    </div>
  );
};

function PartiesPage() {
  const { user } = useAuth();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [activeElection, setActiveElection] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [votingProgress, setVotingProgress] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partyRes, voteCheckRes, electionRes] = await Promise.all([
          api.get('/parties'),
          api.get('/votes/check'),
          api.get('/elections')
        ]);
        setParties(partyRes.data.filter(p => p.isActive));
        setHasVoted(voteCheckRes.data.hasVoted);
        const active = electionRes.data.find(e => e.status === 'active' && (e.type === 'party' || e.type === 'both'));
        setActiveElection(active);
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
    setSelectedParty(party);
    setShowConfirmModal(true);
  };

  const confirmVote = async () => {
    setVotingProgress(true);
    try {
      await api.post('/parties/vote', { partyId: selectedParty._id });
      toast.success(`Success! You have voted for ${selectedParty.name}`);
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
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {parties.map(party => (
            <div key={party._id} className="card" style={{ textAlign: 'center', transition: 'all 0.3s ease', border: '1px solid #f1f5f9', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', opacity: (hasVoted || !activeElection || user?.role === 'admin') ? 0.8 : 1, display: 'flex', flexDirection: 'column' }}>
              {party.logoUrl ? (
                <img src={getFullUrl(party.logoUrl)} alt={party.name} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', margin: '0 auto 1.5rem auto', boxShadow: 'var(--shadow-md)' }} />
              ) : (
                <div style={{ width: '120px', height: '120px', borderRadius: '20px', background: '#eef2ff', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '3rem' }}>🏛️</div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{party.name}</h3>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>{party.abbreviation}</p>
              <DescriptionCell text={party.description} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => party.referenceUrl && window.open(party.referenceUrl, '_blank')} 
                  className="btn" 
                  style={{ width: '100%', padding: '1rem', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
                >
                  Account Details
                </button>
                <button onClick={() => handleVoteClick(party)} className="btn btn-primary" disabled={hasVoted || !activeElection || user?.role === 'admin'} style={{ width: '100%', padding: '1rem', background: (hasVoted || !activeElection || user?.role === 'admin') ? '#94a3b8' : 'var(--primary)' }}>
                  {hasVoted ? 'Vote Cast' : !activeElection ? 'Election Closed' : user?.role === 'admin' ? 'Admin Restricted' : 'Elect the Party'}
                </button>
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
              Are you sure you want to vote for <br/><strong style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{selectedParty.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={confirmVote} className="btn btn-primary" disabled={votingProgress} style={{ flex: 1, padding: '1rem' }}>
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

export default PartiesPage;
