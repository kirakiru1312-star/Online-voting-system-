import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

function AdminVoters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const res = await api.get('/admin/voters');
      setVoters(res.data);
    } catch (err) {
      console.error('Failed to fetch voters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '3rem' }}>
        <h1>Registered Voters</h1>
        <p style={{ color: '#64748b' }}>Full registry of citizens registered in the voting system. Passwords are securely encrypted and hidden.</p>
      </div>

      {loading ? <p>Loading voter database...</p> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Voter Name</th>
                  <th>Profile Details</th>
                  <th>Location (Region/Sub-City)</th>
                  <th>National ID (FAN)</th>
                  <th>Vote Status</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{voter.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{voter.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div><strong>Age:</strong> {voter.age}</div>
                        <div><strong>Phone:</strong> {voter.phone}</div>
                        <div><strong>Job:</strong> {voter.profession}</div>
                        <div><strong>Sex:</strong> {voter.sex || '—'}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>{voter.region}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{voter.subCity}, Kebele {voter.kebele}</div>
                      </div>
                    </td>
                    <td><code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{voter.nationalId}</code></td>
                    <td>
                      {voter.hasVoted ? (
                        <span style={{ color: '#166534', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>VOTED</span>
                      ) : (
                        <span style={{ color: '#991b1b', background: '#fee2e2', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>PENDING</span>
                      )}
                    </td>
                  </tr>
                ))}
                {voters.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No voters found in the registry.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVoters;
