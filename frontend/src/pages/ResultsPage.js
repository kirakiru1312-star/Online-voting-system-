import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ServiceUnavailable from '../components/ServiceUnavailable';

function ResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceDown, setServiceDown] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/results/${id}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch results');
        setServiceDown(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${api.defaults.baseURL.replace('/api', '')}${path}`;
  };

  if (loading) return <div className="container"><p>Loading results...</p></div>;
  if (serviceDown) return <div className="container"><ServiceUnavailable /></div>;
  if (!data) return <div className="container"><p>No results found.</p></div>;

  if (data.election.status !== 'completed') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🤐 Results are Hidden</h1>
        <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          To prevent voter influence, results for active and upcoming elections are kept private. Please check back once the election is officially <strong>closed</strong>.
        </p>
        <Link to="/" className="btn btn-primary">Back to Elections</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600 }}>&larr; Back to Elections</Link>
        <h1 style={{ marginTop: '1rem' }}>Results: {data.election.title}</h1>
        <p style={{ color: '#64748b' }}>Total Votes Cast: <strong>{data.totalVotes}</strong></p>
      </div>

      <div className="card">
        {data.results.map((result, index) => (
          <div key={result.candidate.id} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: index === 0 ? '#eab308' : '#64748b', width: '30px' }}>
                  #{index + 1}
                </span>
                <img 
                  src={getFullUrl(result.candidate.photoUrl) || 'https://via.placeholder.com/40'} 
                  alt="avatar" 
                  style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', background: '#f1f5f9' }} 
                />
                <div>
                  <h3 style={{ margin: 0 }}>{result.candidate.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{result.candidate.party?.name}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0 }}>{result.votes} votes</h3>
                <p style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>{result.percentage}%</p>
              </div>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${result.percentage}%`, 
                  height: '100%', 
                  background: index === 0 ? 'linear-gradient(90deg, #4f46e5, #7c3aed)' : '#94a3b8',
                  transition: 'width 1s ease-out'
                }} 
              />
            </div>
          </div>
        ))}

        {data.results.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No votes have been cast in this election yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;
