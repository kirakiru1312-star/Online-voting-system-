import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

function AdminElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    type: 'both' // Default to both
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data);
    } catch (err) {
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  };

  const handleEdit = (election) => {
    setEditingId(election._id);
    setFormData({
      title: election.title,
      description: election.description || '',
      startDate: formatForInput(election.startDate),
      endDate: formatForInput(election.endDate),
      status: election.status,
      type: election.type || 'both'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', startDate: '', endDate: '', status: 'upcoming', type: 'both' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/elections/${editingId}`, formData);
        toast.success('Election updated successfully');
      } else {
        await api.post('/elections', formData);
        toast.success('Election created successfully');
      }
      cancelEdit();
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        await api.delete(`/elections/${id}`);
        toast.success('Election deleted');
        fetchElections();
      } catch (err) {
        toast.error('Failed to delete election');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'completed': return '#64748b';
      case 'upcoming': return '#eab308';
      default: return '#333';
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{editingId ? 'Edit Election' : 'Create New Election'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Election Title</label>
            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="2" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input type="datetime-local" name="startDate" className="form-control" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="datetime-local" name="endDate" className="form-control" value={formData.endDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Election Type</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                <option value="party">Party Election</option>
                <option value="candidate">Candidate Election</option>
                <option value="both">Both (Party & Candidate)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Election' : 'Create Election'}</button>
            {editingId && <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All Elections</h2>
        {loading ? <p>Loading elections...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election._id}>
                    <td style={{ fontWeight: 600 }}>{election.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{election.type || 'Both'}</td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                        textTransform: 'uppercase', background: `${getStatusColor(election.status)}22`, color: getStatusColor(election.status)
                      }}>{election.status}</span>
                    </td>
                    <td>{new Date(election.startDate).toLocaleString()}</td>
                    <td>{new Date(election.endDate).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleEdit(election)} style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => handleDelete(election._id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 600 }}>Delete</button>
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

export default AdminElections;
