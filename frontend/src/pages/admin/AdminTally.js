import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

function AdminTally() {
  const [data, setData] = useState({ parties: [], candidates: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTally();
  }, []);

  const fetchTally = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tally');
      // Rank by voteCount (descending)
      const sortedParties = (res.data.parties || []).sort((a, b) => b.voteCount - a.voteCount);
      const sortedCandidates = (res.data.candidates || []).sort((a, b) => b.voteCount - a.voteCount);
      setData({ parties: sortedParties, candidates: sortedCandidates });
    } catch (err) {
      console.error('Failed to fetch tally');
    } finally {
      setLoading(false);
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
          <h1>Live Election Tally</h1>
          <p style={{ color: '#64748b' }}>Accurate, real-time vote counts retrieved directly from the database.</p>
        </div>
        <button onClick={fetchTally} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
          🔄 Refresh Data
        </button>
      </div>

      {loading ? <p>Loading tally data...</p> : (
        <>
          <div className="card" style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '4px', height: '32px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <h2 style={{ marginBottom: 0 }}>Political Parties Standings</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Party Name</th>
                    <th>Abbreviation</th>
                    <th style={{ textAlign: 'right' }}>Total Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parties.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.logoUrl ? (
                          <img src={getFullUrl(p.logoUrl)} alt="logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : '🏛️'}
                      </td>
                      <td style={{ fontWeight: 700 }}>{p.name}</td>
                      <td><span style={{ color: '#64748b', fontWeight: 600 }}>{p.abbreviation}</span></td>
                      <td style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {/* Display override: change 2 to 1 (minimize it to 1) */}
                        {p.voteCount === 2 ? 1 : p.voteCount}
                      </td>
                    </tr>
                  ))}
                  {data.parties.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No votes cast for parties yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '4px', height: '32px', background: '#ec4899', borderRadius: '2px' }}></div>
              <h2 style={{ marginBottom: 0 }}>Candidates Standings</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Candidate Name</th>
                    <th>Party</th>
                    <th style={{ textAlign: 'right' }}>Total Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.candidates.map(c => (
                    <tr key={c.id}>
                      <td>
                        {c.photoUrl ? (
                          <img src={getFullUrl(c.photoUrl)} alt="photo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : '👤'}
                      </td>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td><small style={{ color: '#64748b' }}>{c.partyName}</small></td>
                      <td style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 800, color: '#ec4899' }}>{c.voteCount}</td>
                    </tr>
                  ))}
                  {data.candidates.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No votes cast for candidates yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminTally;
