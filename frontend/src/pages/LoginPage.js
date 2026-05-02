import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero-bg.jpg';
import './AuthPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/elections');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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
      
      {/* Lighter Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        zIndex: -1
      }}></div>

      <div className="auth-card" style={{ 
        backdropFilter: 'blur(15px)', 
        background: 'rgba(255,255,255,0.07)', 
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: 'white' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', width: '130px', flexShrink: 0 }}>Email</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              placeholder="you@example.com" 
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', width: '100%' }}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', width: '130px', flexShrink: 0 }}>Password</label>
            <div style={{ position: 'relative', flexGrow: 1, width: '100%' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                required 
                placeholder="••••••••" 
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', width: '100%', paddingRight: '3rem' }}
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
          <button type="submit" className="btn-submit" disabled={loading} style={{ fontWeight: 800 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch" style={{ color: 'white' }}>
          Don't have an account? <Link to="/register" style={{ color: '#22c55e', fontWeight: 800 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
