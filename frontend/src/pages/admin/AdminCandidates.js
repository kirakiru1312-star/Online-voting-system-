import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ServiceUnavailable from '../../components/ServiceUnavailable';

function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', bio: '', election: '', referenceUrl: ''
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [candRes, elecRes] = await Promise.allSettled([
        api.get('/candidates'),
        api.get('/elections')
      ]);
      if (candRes.status === 'fulfilled') setCandidates(candRes.value.data);
      else if (!candRes.reason?.response || candRes.reason?.response?.status === 502 || candRes.reason?.response?.status === 503) {
        setServiceError(true);
      }
      if (elecRes.status === 'fulfilled') setElections(elecRes.value.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleEdit = (cand) => {
    setEditingId(cand._id);
    setFormData({
      name: cand.name, bio: cand.bio || '',
      election: cand.election?._id || '',
      referenceUrl: cand.referenceUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', bio: '', election: '', referenceUrl: '' });
    setPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    // Explicitly set party to null for independent candidates
    data.append('party', ''); 
    data.append('election', formData.election);
    data.append('referenceUrl', formData.referenceUrl);
    if (photo) data.append('photo', photo);

    try {
      if (editingId) {
        await api.put(`/candidates/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Independent Candidate updated successfully');
      } else {
        await api.post('/candidates', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Independent Candidate added successfully');
      }
      cancelEdit();
      e.target.reset();
      const candRes = await api.get('/candidates');
      setCandidates(candRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/candidates/${id}`);
        toast.success('Independent Candidate removed');
        setCandidates(candidates.filter(c => c._id !== id));
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleToggleStatus = async (cand) => {
    try {
      await api.put(`/candidates/${cand._id}`, { isActive: !cand.isActive });
      toast.success(`Candidate ${cand.isActive ? 'disabled' : 'enabled'} successfully`);
      const candRes = await api.get('/candidates');
      setCandidates(candRes.data);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${api.defaults.baseURL.replace('/api', '')}${path}`;
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{editingId ? 'Edit Independent Candidate' : 'Add Independent Candidate'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Candidate Name</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label>Photo</label><input type="file" className="form-control" onChange={handleFileChange} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Election Assignment</label>
              <select name="election" className="form-control" value={formData.election} onChange={handleChange} required>
                <option value="">Select Election</option>
                {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Portfolio/Reference URL</label><input type="url" name="referenceUrl" className="form-control" value={formData.referenceUrl} onChange={handleChange} placeholder="https://example.com" /></div>
          </div>
          <div className="form-group"><label>Biography</label><textarea name="bio" className="form-control" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us about the independent candidate..." /></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Candidate' : 'Register Candidate'}</button>
            {editingId && <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Independent Candidates List</h2>
        {loading ? <p>Loading...</p> : serviceError ? <ServiceUnavailable /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name & Status</th>
                  <th>Election</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand) => (
                  <tr key={cand._id} style={{ opacity: cand.isActive ? 1 : 0.6 }}>
                    <td>{cand.photoUrl ? <img src={getFullUrl(cand.photoUrl)} alt="cand" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }} /> : <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{cand.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Independent Candidate</div>
                    </td>
                    <td><div style={{ fontSize: '0.85rem' }}>{cand.election?.title}</div></td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800,
                        background: cand.isActive ? '#dcfce7' : '#fee2e2', color: cand.isActive ? '#166534' : '#991b1b'
                      }}>
                        {cand.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '1.25rem' }}>
                        <button onClick={() => handleToggleStatus(cand)} style={{ color: cand.isActive ? '#eab308' : '#22c55e', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{cand.isActive ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => handleEdit(cand)} style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(cand._id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No independent candidates registered yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCandidates;
