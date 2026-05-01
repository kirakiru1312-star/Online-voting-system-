import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneFirstDigit, setPhoneFirstDigit] = useState('9');
  const [phoneRemaining, setPhoneRemaining] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
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
    const lettersOnly = ['firstName', 'lastName', 'nationality', 'profession'];
    if (lettersOnly.includes(name) && value !== '' && !/^[A-Za-z ]+$/.test(value)) return;
    const numbersOnly = ['age', 'nationalId'];
    if (numbersOnly.includes(name) && value !== '' && !/^\d+$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  const handlePhoneRemainingChange = (e) => {
    const value = e.target.value;
    if (value !== '' && !/^\d+$/.test(value)) return;
    if (value.length > 8) return; // 1 selected + 8 entered = 9 total
    setPhoneRemaining(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(form.age) < 18) return toast.error('You must be 18 years or older to register');
    
    // Phone validation
    const fullPhone = `+251${phoneFirstDigit}${phoneRemaining}`;
    if (phoneRemaining.length !== 8) {
      return toast.error('Phone number must contain exactly 9 digits in total.');
    }

    // National ID validation
    if (form.nationalId.length < 16) {
      return toast.error('National ID must be at least 16 digits');
    }

    if (form.profession.toLowerCase() === 'soldier') return toast.error('Soldiers are not allowed to register');

    setLoading(true);
    try {
      const res = await registerUser({ ...form, phone: fullPhone });
      login(res.data.user, res.data.token);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '2rem 0' }}>
      <div className="auth-card" style={{ maxWidth: '800px', width: '95%' }}>
        <h2>Voter Registration</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please provide your official information to register for the voting system.</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>First Name</label><input type="text" name="firstName" value={form.firstName} onChange={handleChange} required /></div>
            <div className="form-group"><label>Last Name</label><input type="text" name="lastName" value={form.lastName} onChange={handleChange} required /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Email Address</label><input type="email" name="email" value={form.email} onChange={handleChange} required /></div>
            <div className="form-group"><label>Password</label><input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Age (Must be 18+)</label><input type="text" name="age" value={form.age} onChange={handleChange} required /></div>
            <div className="form-group"><label>Nationality</label><input type="text" name="nationality" value={form.nationality} onChange={handleChange} required /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Phone Number <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>(The length must be only 9 digits.)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>+251</span>
                <select 
                  value={phoneFirstDigit} 
                  onChange={(e) => setPhoneFirstDigit(e.target.value)}
                  style={{ width: '60px', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}
                >
                  <option value="9">9</option>
                  <option value="7">7</option>
                </select>
                <input 
                  type="text" 
                  value={phoneRemaining} 
                  onChange={handlePhoneRemainingChange} 
                  placeholder="Enter 8 digits"
                  required 
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>National ID (FAN) <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>(The length must be ≥ 16 digits.)</span></label>
              <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange} required minLength="16" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Profession (Job)</label><input type="text" name="profession" value={form.profession} onChange={handleChange} required placeholder="No Soldiers allowed" /></div>
            <div className="form-group">
              <label>Region</label>
              <select name="region" value={form.region} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Wereda / Sub-City</label><input type="text" name="subCity" value={form.subCity} onChange={handleChange} required /></div>
            <div className="form-group"><label>Kebele</label><input type="text" name="kebele" value={form.kebele} onChange={handleChange} required /></div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '2rem', width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {loading ? 'Processing...' : 'Register as Voter'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
