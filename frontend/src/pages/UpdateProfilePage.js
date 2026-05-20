import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero-bg.jpg';
import './AuthPage.css';
import ServiceUnavailable from '../components/ServiceUnavailable';

const UpdateProfilePage = () => {
  const { user, login, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [serviceDown, setServiceDown] = useState(false);
  const [phoneFirstDigit, setPhoneFirstDigit] = useState('9');
  const [phoneRemaining, setPhoneRemaining] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    age: '', nationalId: '', profession: '', sex: '',
    nationality: 'Ethiopian', region: '', subCity: '', kebele: ''
  });

  const hasVoted = user?.hasVoted || false;

  const regions = [
    'Amhara Region', 'Oromia Region', 'Tigray Region', 'Afar Region',
    'Somali Region', 'Benishangul-Gumuz Region', "Gambela Peoples' Region",
    'Harari People Region', 'Sidama Region', 'South West Ethiopia Peoples\' Region',
    'South Ethiopia Region', 'Central Ethiopia Region', 'Addis Ababa', 'Dire Dawa'
  ];

  // Fetch existing profile data and pre-fill form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const u = res.data.user;
        // Parse phone: +251XXXXXXXXX → first digit + remaining 8
        let parsedFirstDigit = '9';
        let parsedRemaining = '';
        if (u.phone && u.phone.startsWith('+251')) {
          const digits = u.phone.slice(4); // remove +251
          parsedFirstDigit = digits.charAt(0) || '9';
          parsedRemaining = digits.slice(1);
        }
        setPhoneFirstDigit(parsedFirstDigit);
        setPhoneRemaining(parsedRemaining);
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          password: '',
          confirmPassword: '',
          age: u.age ? String(u.age) : '',
          nationalId: u.nationalId || '',
          profession: u.profession || '',
          sex: u.sex || '',
          nationality: u.nationality || 'Ethiopian',
          region: u.region || '',
          subCity: u.subCity || '',
          kebele: u.kebele || ''
        });
      } catch (err) {
        toast.error('Failed to load profile data.');
        setServiceDown(true);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Letters only fields — identical to RegisterPage
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

    if (hasVoted) return; // extra guard — button is disabled but just in case

    // === Identical validation to RegisterPage ===
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

    // Profession restriction
    if (form.profession.trim().toLowerCase() === 'soldier') {
      return toast.error('Soldiers are not eligible to vote.');
    }

    // Password validation only if the user typed something in the password field
    if (form.password) {
      const hasLetter = /[a-zA-Z]/.test(form.password);
      const hasNumber = /[0-9]/.test(form.password);
      const hasSymbol = /[^a-zA-Z0-9]/.test(form.password);

      if (form.password.length < 8 || !hasLetter || !hasNumber || !hasSymbol) {
        return toast.error('Password must be at least 8 characters long and contain at least one letter, one number, and one symbol');
      }

      if (form.password !== form.confirmPassword) {
        return toast.error('Passwords do not match');
      }
    }
    // === End of identical validation ===

    setLoading(true);
    try {
      const payload = { ...form, phone: fullPhone };
      // Only include password if the user actually typed one
      if (!form.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      const res = await api.put('/auth/profile', payload);
      // Update auth context with new name/email
      login(res.data.user, token);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
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

  const disabledInputStyle = {
    ...inputStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  const labelStyle = {
    color: 'white',
    fontSize: '0.9rem',
    marginBottom: '0.4rem',
    fontWeight: 600,
    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
  };

  if (fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (serviceDown) {
    return (
      <div style={{
        position: 'relative', overflow: 'hidden', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(1.1) contrast(1.1)', zIndex: -2
        }}></div>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)', zIndex: -1
        }}></div>
        <div style={{ maxWidth: '600px', width: '95%', zIndex: 1 }}>
          <ServiceUnavailable />
        </div>
      </div>
    );
  }

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

      {/* Overlay */}
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
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Update Profile
        </h2>

        {/* Informational Notice */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Amharic notice */}
          <p style={{ color: '#fde68a', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '0.75rem', fontWeight: 600 }}>
            ማስታወሻ፦ መረጃዎን ማስተካከል የሚችሉት ድምፅ ከመስጠትዎ በፊት ብቻ ነው። ድምፅ ከሰጡ በኋላ መረጃ ማስተካከል አይቻልም።
          </p>
          {/* English notice */}
          <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
            Note: You can update your profile information only before voting. After you have voted, profile updates will be disabled.
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required style={hasVoted ? { ...disabledInputStyle, width: '100%' } : { ...inputStyle, width: '100%' }} disabled={hasVoted} autoComplete="off" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label style={labelStyle}>New Password <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#fbbf24' }}>(leave blank to keep current)</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  style={hasVoted ? { ...disabledInputStyle, width: '100%', paddingRight: '3rem' } : { ...inputStyle, width: '100%', paddingRight: '3rem' }}
                  disabled={hasVoted}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {(form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password)) ? (
                    <span style={{ color: 'green' }}>strong</span>
                  ) : (
                    <span style={{ color: 'red' }}>Min 8 chars with at least one letter, one number, and one special character</span>
                  )}
                </div>
              )}
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={hasVoted ? { ...disabledInputStyle, width: '100%', paddingRight: '3rem' } : { ...inputStyle, width: '100%', paddingRight: '3rem' }}
                  disabled={hasVoted}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Age (Must be 18+)</label>
              <input type="text" name="age" value={form.age} onChange={handleChange} required style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Nationality</label>
              <input type="text" name="nationality" value={form.nationality} onChange={handleChange} required style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} readOnly />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Phone Number <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#fbbf24' }}>(Exactly 9 digits)</span></label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '8px' }}>+251</span>
                <select
                  value={phoneFirstDigit}
                  onChange={(e) => setPhoneFirstDigit(e.target.value)}
                  disabled={hasVoted}
                  style={{ width: '70px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', opacity: hasVoted ? 0.5 : 1, cursor: hasVoted ? 'not-allowed' : 'default' }}
                >
                  <option value="9">9</option>
                  <option value="7">7</option>
                </select>
                <input type="text" value={phoneRemaining} onChange={handlePhoneRemainingChange} placeholder="Enter 8 digits" required style={hasVoted ? { ...disabledInputStyle, flex: 1 } : { ...inputStyle, flex: 1 }} disabled={hasVoted} />
              </div>
            </div>
            <div className="form-group">
              <label style={labelStyle}>National ID (FAN) <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#fbbf24' }}>(≥ 16 digits)</span></label>
              <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange} required minLength="16" style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Profession <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>(not soldier)</span></label>
              <input type="text" name="profession" value={form.profession} onChange={handleChange} required style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Sex</label>
              <select name="sex" value={form.sex} onChange={handleChange} required disabled={hasVoted} style={hasVoted ? { ...disabledInputStyle, width: '100%', color: '#0f172a' } : { ...inputStyle, width: '100%', color: form.sex ? 'white' : 'rgba(255,255,255,0.6)' }} autoComplete="off">
                <option value="" style={{ color: '#0f172a' }}>Select Sex</option>
                <option value="Male" style={{ color: '#0f172a' }}>Male</option>
                <option value="Female" style={{ color: '#0f172a' }}>Female</option>
                <option value="Intersex" style={{ color: '#0f172a' }}>Intersex</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Region</label>
              <select name="region" value={form.region} onChange={handleChange} required disabled={hasVoted} style={hasVoted ? { ...disabledInputStyle, width: '100%', color: '#0f172a' } : { ...inputStyle, width: '100%', color: '#0f172a' }} autoComplete="off">
                <option value="" style={{ color: '#0f172a' }}>Select Region</option>
                {regions.map(r => <option key={r} value={r} style={{ color: '#0f172a' }}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={labelStyle}>Wereda / Sub-City</label>
              <input type="text" name="subCity" value={form.subCity} onChange={handleChange} required style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={labelStyle}>Kebele</label>
              <input type="text" name="kebele" value={form.kebele} onChange={handleChange} required style={hasVoted ? disabledInputStyle : inputStyle} disabled={hasVoted} autoComplete="off" />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading || hasVoted}
            style={{
              marginTop: '2rem',
              width: '100%',
              padding: '1.25rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              opacity: hasVoted ? 0.45 : 1,
              cursor: hasVoted ? 'not-allowed' : 'pointer'
            }}
          >
            {hasVoted ? 'Update Disabled (Already Voted)' : loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
