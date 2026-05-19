import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
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
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email', 'otp', 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin/system' : '/elections');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/request-otp', { email: forgotEmail });
      toast.success('Verification code sent to your email.');
      setForgotStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: forgotEmail, otp: forgotOtp });
      toast.success('Code verified successfully.');
      setForgotStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Identical validation to registration password rules
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^a-zA-Z0-9]/.test(newPassword);

    if (newPassword.length < 8 || !hasLetter || !hasNumber || !hasSymbol) {
      return toast.error('Password must be at least 8 characters long and contain at least one letter, one number, and one symbol');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, newPassword });
      toast.success('Password reset successful. Please login.');
      setShowForgotModal(false);
      setForgotStep('email');
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setShowResetPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a'
    }}>
      {/* Background Image Layer */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(1.1) contrast(1.1)',
        zIndex: 0
      }}></div>
      
      {/* Lighter Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        zIndex: 1
      }}></div>

      <div className="auth-card" style={{ 
        backdropFilter: 'blur(15px)', 
        background: 'rgba(255,255,255,0.07)', 
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        zIndex: 2
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
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)} 
              style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Forgot Password?
            </button>
          </div>
        </form>
        <p className="auth-switch" style={{ color: 'white' }}>
          Don't have an account? <Link to="/register" style={{ color: '#22c55e', fontWeight: 800 }}>Register</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2.5rem', background: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#1e293b' }}>Reset Password</h2>
            
            {forgotStep === 'email' && (
              <form onSubmit={handleRequestForgotOtp}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter your email address to receive a verification code.</p>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control"
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    required 
                    placeholder="you@example.com"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading} style={{ width: '100%' }}>
                  {forgotLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyForgotOtp}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter the 6-digit code sent to <strong>{forgotEmail}</strong>.</p>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Verification Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    maxLength="6"
                    value={forgotOtp} 
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))} 
                    required 
                    placeholder="123456"
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading} style={{ width: '100%' }}>
                  {forgotLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Identity verified. Please enter your new password.</p>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showResetPassword ? "text" : "password"}
                      className="form-control"
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      placeholder="Min 8 chars, letter, number, symbol"
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: '#64748b'
                      }}
                    >
                      {showResetPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', fontWeight: 'bold' }}>
                    {newPassword.length > 0 && (
                      (/[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword) && newPassword.length >= 8)
                        ? <span style={{ color: 'green' }}>strong</span>
                        : <span style={{ color: 'red' }}>password must be &gt;= 8 characters with at least one letter, one number, and one symbol</span>
                    )}
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showResetPassword ? "text" : "password"}
                      className="form-control"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      placeholder="Re-enter new password"
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: '#64748b'
                      }}
                    >
                      {showResetPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={forgotLoading} style={{ width: '100%' }}>
                  {forgotLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            <button 
              onClick={() => { setShowForgotModal(false); setForgotStep('email'); }} 
              className="btn" 
              style={{ width: '100%', marginTop: '1rem', background: '#f1f5f9', color: '#475569' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
