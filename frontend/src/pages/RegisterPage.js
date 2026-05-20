import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero-bg.jpg';
import './AuthPage.css';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneFirstDigit, setPhoneFirstDigit] = useState('9');
  const [phoneRemaining, setPhoneRemaining] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    age: '', nationalId: '', profession: '',
    nationality: 'Ethiopian', region: '', subCity: '', kebele: ''
  });

  const regions = [
    'Amhara Region', 'Oromia Region', 'Tigray Region', 'Afar Region',
    'Somali Region', 'Benishangul-Gumuz Region', 'Gambela Peoples\' Region',
    'Harari People Region', 'Sidama Region', 'South West Ethiopia Peoples\' Region',
    'South Ethiopia Region', 'Central Ethiopia Region', 'Addis Ababa', 'Dire Dawa'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Letters only fields
    const lettersOnly = ['firstName', 'lastName', 'subCity', 'profession', 'nationality'];
    if (lettersOnly.includes(name) && value !== '' && !/^[A-Za-z ]+$/.test(value)) return;
    
    // Numbers only fields
    const numbersOnly = ['age', 'nationalId'];
    if (numbersOnly.includes(name) && value !== '' && !/^\d+$/.test(value)) return;

    // Alphanumeric only fields
    if (name === 'kebele' && value !== '' && !/^[A-Za-z0-9]+$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  const handlePhoneRemainingChange = (e) => {
    const value = e.target.value;
    if (value !== '' && !/^\d+$/.test(value)) return;
    if (value.length > 8) return;
    setPhoneRemaining(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(form.age) < 18) return toast.error('You must be 18 years or older to register');
    
    const fullPhone = `+251${phoneFirstDigit}${phoneRemaining}`;
    if (phoneRemaining.length !== 8) {
      return toast.error('Phone number must contain exactly 9 digits in total.');
    }

    if (form.nationalId.length < 16) {
      return toast.error('National ID must be at least 16 digits');
    }

    if (form.firstName.length < 2 || form.lastName.length < 2) {
      return toast.error('First and Last names must be at least 2 characters long');
    }

    // Password strength: Min 8, at least 1 letter, 1 number, and 1 symbol
    const hasLetter = /[a-zA-Z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(form.password);

    if (form.password.length < 8 || !hasLetter || !hasNumber || !hasSymbol) {
      return toast.error('Password must be at least 8 characters long and contain at least one letter, one number, and one symbol');
    }

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { ...form, phone: fullPhone });
      login(res.data.user, res.data.token);
      toast.success('Registration successful!');
      navigate('/elections');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { 
    background: 'rgba(255,255,255,0.2)', 
    color: 'white', 
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '0.75rem',
    fontWeight: 500
  };

  const labelStyle = { color: 'white', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' };

  return (
    <div className="auth-container" style={{ 
      position: 'relative',
      overflow: 'hidden',
      minHeight: '120vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem'
    }}>
      {/* Background Image Layer */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(1.1) contrast(1.1)',
        zIndex: -2
      }}></div>
      
      {/* Minimal Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        zIndex: -1
      }}></div>

      <div className="auth-card" style={{ 
        maxWidth: '850px', 
        width: '95%',
        backdropFilter: 'blur(20px)', 
        background: 'rgba(255,255,255,0.1)', 
        border: '1px solid rgba(255,255,255,0.4)',
        padding: '3rem',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Voter Registration</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label style={labelStyle}>First Name</label><input type="text" name="firstName" value={form.firstName} onChange={handleChange} required style={inputStyle} autoComplete="off" /></div>
            <div className="form-group"><label style={labelStyle}>Last Name</label><input type="text" name="lastName" value={form.lastName} onChange={handleChange} required style={inputStyle} autoComplete="off" /></div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ ...inputStyle, width: '100%' }} autoComplete="off" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                  style={{ ...inputStyle, width: '100%', paddingRight: '3rem' }} 
                  autoComplete="new-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {(form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password)) ? (
                  <span style={{ color: 'green' }}>strong</span>
                ) : (
                  <span style={{ color: 'red' }}>password must be &gt;= 3 character and &gt;= 8 length</span>
                )}
              </div>
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  style={{ ...inputStyle, width: '100%', paddingRight: '3rem' }} 
                  autoComplete="new-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label style={labelStyle}>Age (Must be 18+)</label><input type="text" name="age" value={form.age} onChange={handleChange} required style={inputStyle} autoComplete="off" /></div>
            <div className="form-group"><label style={labelStyle}>Nationality</label><input type="text" name="nationality" value={form.nationality} onChange={handleChange} required style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} readOnly /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Phone Number <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#fbbf24' }}>(Exactly 9 digits)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '8px' }}>+251</span>
                <select 
                  value={phoneFirstDigit} 
                  onChange={(e) => setPhoneFirstDigit(e.target.value)}
                  style={{ width: '70px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <option value="9">9</option>
                  <option value="7">7</option>
                </select>
                <input type="text" value={phoneRemaining} onChange={handlePhoneRemainingChange} placeholder="Enter 8 digits" required style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div className="form-group">
              <label style={labelStyle}>National ID (FAN) <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#fbbf24' }}>(≥ 16 digits)</span></label>
              <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange} required minLength="16" style={inputStyle} autoComplete="off" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Profession <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>(not soldier)</span></label>
              <input type="text" name="profession" value={form.profession} onChange={handleChange} required style={inputStyle} autoComplete="off" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Region</label>
              <select name="region" value={form.region} onChange={handleChange} required style={{ ...inputStyle, width: '100%', color: '#0f172a' }} autoComplete="off">
                <option value="" style={{ color: '#0f172a' }}>Select Region</option>
                {regions.map(r => <option key={r} value={r} style={{ color: '#0f172a' }}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label style={labelStyle}>Wereda / Sub-City</label><input type="text" name="subCity" value={form.subCity} onChange={handleChange} required style={inputStyle} autoComplete="off" /></div>
            <div className="form-group"><label style={labelStyle}>Kebele</label><input type="text" name="kebele" value={form.kebele} onChange={handleChange} required style={inputStyle} autoComplete="off" /></div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '2rem', width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>
            {loading ? 'Processing...' : 'Register as Voter'}
          </button>
        </form>
        <p className="auth-switch" style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Already have an account? <Link to="/login" style={{ color: '#22c55e', fontWeight: 800 }}>Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
