import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DescriptionCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = text && text.length > 120;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p className={expanded ? '' : 'text-clamp-3'} style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6' }}>
        {text || 'No description provided.'}
      </p>
      {needsExpansion && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.85rem', marginTop: '0.25rem' }}
        >
          {expanded ? 'Show Less' : 'More...'}
        </button>
      )}
    </div>
  );
};

function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/elections');
        setElections(res.data);
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Elections Portal</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Browse active and upcoming elections to cast your vote.</p>
      </div>

      {loading ? (
        <p>Loading elections...</p>
      ) : (
        <>
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '4px', height: '32px', background: '#22c55e', borderRadius: '2px' }}></div>
              <h2 style={{ marginBottom: 0 }}>Active Elections</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {elections.filter(e => e.status !== 'completed').map(election => (
                <div key={election._id} className="card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', 
                        color: election.status === 'active' ? '#166534' : '#854d0e',
                        background: election.status === 'active' ? '#dcfce7' : '#fef9c3',
                        padding: '0.3rem 0.6rem', borderRadius: '6px'
                      }}>{election.status}</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Ends {new Date(election.endDate).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{election.title}</h3>
                    <DescriptionCell text={election.description} />
                  </div>
                </div>
              ))}
              {elections.filter(e => e.status !== 'completed').length === 0 && (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: '#f8fafc' }}>
                  <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No active or upcoming elections found.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '4px', height: '32px', background: '#94a3b8', borderRadius: '2px' }}></div>
              <h2 style={{ marginBottom: 0 }}>Closed Elections</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {elections.filter(e => e.status === 'completed').map(election => (
                <div key={election._id} className="card" style={{ opacity: 0.85, border: '1px solid #f1f5f9' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>Closed</span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>{election.title}</h3>
                  <Link to={`/results/${election._id}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>View Final Results &rarr;</Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ElectionsPage;
