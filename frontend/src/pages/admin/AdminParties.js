import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ServiceUnavailable from '../../components/ServiceUnavailable';

function AdminParties() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: '',
    referenceUrl: '',
  });
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const res = await api.get('/parties');
      setParties(res.data);
    } catch (err) {
      if (!err.response || err.response.status === 502 || err.response.status === 503) {
        setServiceError(true);
      } else {
        toast.error('Failed to fetch parties');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleEdit = (party) => {
    setEditingId(party._id);
    setFormData({
      name: party.name,
      abbreviation: party.abbreviation,
      description: party.description || '',
      referenceUrl: party.referenceUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', abbreviation: '', description: '', referenceUrl: '' });
    setLogo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('abbreviation', formData.abbreviation);
    data.append('description', formData.description);
    data.append('referenceUrl', formData.referenceUrl);
    if (logo) data.append('logo', logo);

    try {
      if (editingId) {
        await api.put(`/parties/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Party updated successfully');
      } else {
        await api.post('/parties', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Party added successfully');
      }
      cancelEdit();
      e.target.reset();
      fetchParties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      try {
        await api.delete(`/parties/${id}`);
        toast.success('Party deleted');
        fetchParties();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete party');
      }
    }
  };

  const handleToggleStatus = async (party) => {
    try {
      await api.put(`/parties/${party._id}`, { isActive: !party.isActive });
      toast.success(`Party ${party.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchParties();
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
        <h2>{editingId ? 'Edit Political Party' : 'Add New Political Party'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Party Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Abbreviation</label>
              <input type="text" name="abbreviation" className="form-control" value={formData.abbreviation} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="3" />
          </div>
          <div className="form-group">
            <label>Reference URL</label>
            <input type="url" name="referenceUrl" className="form-control" value={formData.referenceUrl} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Party Logo {editingId && '(Leave blank to keep existing)'}</label>
            <input type="file" className="form-control" onChange={handleFileChange} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Party' : 'Add Party'}</button>
            {editingId && <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Registered Parties</h2>
        {loading ? <p>Loading parties...</p> : serviceError ? <ServiceUnavailable /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr key={party._id} style={{ opacity: party.isActive ? 1 : 0.6 }}>
                    <td>{party.logoUrl ? <img src={getFullUrl(party.logoUrl)} alt="logo" style={{ width: '32px', height: '32px', borderRadius: '4px' }} /> : 'N/A'}</td>
                    <td><strong>{party.name}</strong> ({party.abbreviation})</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800,
                        background: party.isActive ? '#dcfce7' : '#fee2e2', color: party.isActive ? '#166534' : '#991b1b'
                      }}>
                        {party.isActive ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleToggleStatus(party)} style={{ color: party.isActive ? '#eab308' : '#22c55e', background: 'none', border: 'none', fontWeight: 600 }}>{party.isActive ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => handleEdit(party)} style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => handleDelete(party._id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 600 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminParties;
