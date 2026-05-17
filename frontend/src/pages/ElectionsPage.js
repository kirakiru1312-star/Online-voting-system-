import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import voterHero from '../assets/voter-hero.png';
import ServiceUnavailable from '../components/ServiceUnavailable';

function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/elections');
        setElections(res.data);
      } catch (err) {
        if (!err.response || err.response.status === 502 || err.response.status === 503) {
          setServiceError(true);
        }
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '4rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', color: '#0f172a' }}>Elections Portal</h1>
          <p style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Your voice matters. Browse active elections, review independent candidates and political parties, and cast your secure digital ballot to shape the future.
          </p>
        </div>
        <div style={{ width: '450px', height: '280px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <img src={voterHero} alt="Secure Voting" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {loading ? (
        <p>Loading elections...</p>
      ) : serviceError ? (
        <ServiceUnavailable />
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
                    {/* Display full description without truncation */}
                    <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                      {election.description || 'No description provided.'}
                    </p>
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
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                    {election.description}
                  </p>
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
