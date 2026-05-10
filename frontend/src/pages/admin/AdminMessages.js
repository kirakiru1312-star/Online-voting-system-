import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact/admin');
      setMessages(res.data);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/contact/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const toggleRead = async (id) => {
    try {
      await api.put(`/contact/admin/${id}/read`);
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/contact/admin/${id}`);
      toast.success('Message deleted');
      if (selectedMessage?._id === id) setSelectedMessage(null);
      fetchMessages();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact/admin/reply', { id: selectedMessage._id, note: replyText });
      toast.success('Reply saved');
      setReplyText('');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to save reply');
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      toggleRead(msg._id);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Contact Messages</h1>
          <p style={{ color: '#64748b' }}>Manage voter inquiries and feedback.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '2rem', marginBottom: 0 }}>
            <div><span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Total</span> <strong>{stats.total}</strong></div>
            <div><span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Unread</span> <strong style={{ color: '#ef4444' }}>{stats.unread}</strong></div>
            <div><span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Read</span> <strong style={{ color: '#22c55e' }}>{stats.read}</strong></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
        {/* Messages List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Inbox</h3>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {loading ? <p style={{ padding: '2rem' }}>Loading...</p> : messages.length === 0 ? <p style={{ padding: '2rem' }}>No messages found.</p> : (
              messages.map(msg => (
                <div 
                  key={msg._id} 
                  onClick={() => openMessage(msg)}
                  style={{ 
                    padding: '1.25rem', 
                    borderBottom: '1px solid #f1f5f9', 
                    cursor: 'pointer',
                    background: selectedMessage?._id === msg._id ? '#eff6ff' : 'white',
                    borderLeft: msg.isRead ? '4px solid transparent' : '4px solid #3b82f6',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{msg.user?.name || msg.fullName}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>{msg.subject}</div>
                  <div className="text-clamp-3" style={{ fontSize: '0.8rem', color: '#64748b' }}>{msg.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className="card" style={{ minHeight: '600px' }}>
          {selectedMessage ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>{selectedMessage.subject}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <span><strong>From:</strong> {selectedMessage.user?.name || selectedMessage.fullName} ({selectedMessage.user?.email || selectedMessage.email})</span>
                    {(selectedMessage.user?.phone || selectedMessage.phone) && <span><strong>Phone:</strong> {selectedMessage.user?.phone || selectedMessage.phone}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleRead(selectedMessage._id)} 
                    className="btn" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#f1f5f9' }}
                  >
                    Mark as {selectedMessage.isRead ? 'Unread' : 'Read'}
                  </button>
                  <button 
                    onClick={() => deleteMessage(selectedMessage._id)} 
                    className="btn" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '2.5rem' }}>
                Received on {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>

              {/* Reply Section */}
              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Reply / Note</h3>
                {selectedMessage.replyNote ? (
                  <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '12px', border: '1px solid #6ee7b7' }}>
                    <div style={{ fontSize: '0.8rem', color: '#059669', marginBottom: '0.5rem', fontWeight: 700 }}>REPLY SENT / RECORDED:</div>
                    <p style={{ margin: 0, color: '#065f46' }}>{selectedMessage.replyNote}</p>
                    <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.5rem' }}>{new Date(selectedMessage.repliedAt).toLocaleString()}</div>
                    <button 
                      onClick={() => setSelectedMessage({...selectedMessage, replyNote: ''})} 
                      style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', marginTop: '1rem', padding: 0 }}
                    >
                      Edit Reply
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReply}>
                    <textarea 
                      className="form-control" 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)} 
                      placeholder="Type your response or internal note here..."
                      rows="4"
                      style={{ marginBottom: '1rem' }}
                      required
                    ></textarea>
                    <button type="submit" className="btn btn-primary">Save Reply</button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</span>
              <p>Select a message to read its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;
