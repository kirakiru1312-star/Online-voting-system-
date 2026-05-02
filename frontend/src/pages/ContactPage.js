import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import heroImg from '../assets/hero-bg.jpg';
import './AuthPage.css';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Letters only for Full Name
    if (name === 'fullName' && value !== '' && !/^[A-Za-z ]+$/.test(value)) return;
    
    // Numbers only for Phone
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  const handleClear = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation matching RegisterPage logic
    if (form.fullName.trim().length < 2) {
      return toast.error('Full Name must be at least 2 characters long');
    }

    if (form.phone && form.phone.length !== 10 && form.phone.length !== 9) {
      // System registration uses 9 digits after +251. 
      // For contact us, let's just ensure it's a reasonable digit count if provided.
      // But "identical to registration" might mean the 9 digit rule.
      // However, registration uses a prefix. Let's just stick to "digits only" for optional phone.
    }

    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Your message has been sent successfully!');
      handleClear();
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { 
    background: 'rgba(255,255,255,0.2)', 
    color: 'white', 
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '0.75rem',
    width: '100%',
    borderRadius: '8px',
    outline: 'none'
  };

  const labelStyle = { 
    color: 'white', 
    fontSize: '0.9rem', 
    marginBottom: '0.4rem', 
    fontWeight: 600, 
    display: 'block' 
  };

  const infoItemStyle = {
    marginBottom: '1.5rem',
    color: 'white'
  };

  return (
    <div className="auth-container" style={{ 
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem'
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.6)',
        zIndex: -2
      }}></div>
      
      <div className="auth-card" style={{ 
        maxWidth: '1000px', 
        width: '95%',
        backdropFilter: 'blur(20px)', 
        background: 'rgba(255,255,255,0.1)', 
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '3rem',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        borderRadius: '20px'
      }}>
        
        {/* Left Side: Contact Information */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '2rem' }}>
          <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem' }}>Contact Us</h2>
          <p style={{ color: '#e2e8f0', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Have questions or concerns? Reach out to us and we'll get back to you as soon as possible.
          </p>
          
          <div style={infoItemStyle}>
            <h4 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Organization</h4>
            <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Group One</p>
          </div>
          
          <div style={infoItemStyle}>
            <h4 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Email Address</h4>
            <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>kirakiru1312@gmail.com</p>
          </div>
          
          <div style={infoItemStyle}>
            <h4 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Phone Number</h4>
            <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>+251918826226</p>
          </div>
          
          <div style={infoItemStyle}>
            <h4 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Office Address</h4>
            <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Debre Birhan</p>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                required 
                style={inputStyle} 
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                style={inputStyle} 
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Phone Number (Optional)</label>
              <input 
                type="text" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                style={inputStyle} 
                placeholder="e.g. 0912345678"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Subject</label>
              <input 
                type="text" 
                name="subject" 
                value={form.subject} 
                onChange={handleChange} 
                required 
                style={inputStyle} 
                placeholder="What is this about?"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Message</label>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                required 
                rows="4" 
                style={{ ...inputStyle, resize: 'none' }} 
                placeholder="Write your message here..."
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ flex: 1, padding: '1rem', fontWeight: 800 }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <button 
                type="button" 
                onClick={handleClear} 
                className="btn" 
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  background: '#ef4444', 
                  color: 'white', 
                  fontWeight: 800 
                }}
              >
                Delete All
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
