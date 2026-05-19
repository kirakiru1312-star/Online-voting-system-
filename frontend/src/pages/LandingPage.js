import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImg from '../assets/hero-bg.jpg';

function LandingPage() {
  const { user } = useAuth();

  // If already logged in, go to elections
  if (user) {
    return <Navigate to="/elections" replace />;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0f172a'
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(1.1) contrast(1.1) saturate(1.1)',
        zIndex: 0
      }}></div>
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to right, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.3) 50%, rgba(15, 23, 42, 0.1) 100%)',
        zIndex: 1
      }}></div>

      {/* Content */}
      <div className="container" style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        paddingTop: '5rem',
        paddingBottom: '5rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ maxWidth: '650px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '4px', background: '#eab308', borderRadius: '2px' }}></div>
            <span style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '2px', color: '#eab308', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Ethiopia Decides</span>
          </div>
          
          <h1 style={{ 
            fontSize: '4.5rem', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: '2rem',
            textShadow: '0 4px 30px rgba(0,0,0,0.9)'
          }}>
            The Future of <br/>
            <span style={{ color: '#22c55e' }}>Secure Voting</span> <br/>
            is in Your Hands.
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            lineHeight: 1.6, 
            color: 'white', 
            marginBottom: '3.5rem',
            maxWidth: '500px',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            fontWeight: 500
          }}>
            Experience Ethiopia's most advanced, transparent, and secure digital voting platform. 
            Register today to shape the destiny of our nation from anywhere.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ 
              padding: '1.25rem 2.5rem', 
              fontSize: '1.1rem', 
              fontWeight: 800,
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
            }}>
              Register to Vote
            </Link>
            <Link to="/login" className="btn" style={{ 
              padding: '1.25rem 2.5rem', 
              fontSize: '1.1rem', 
              fontWeight: 800,
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.4)'
            }}>
              Login
            </Link>
          </div>


        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ 
        padding: '2rem', 
        background: 'rgba(15, 23, 42, 0.6)',
        color: '#f1f5f9',
        fontSize: '0.9rem',
        textAlign: 'center',
        backdropFilter: 'blur(5px)',
        position: 'relative',
        zIndex: 2
      }}>
        © 2026 National Election Board of Ethiopia (NEBE) Digital Initiative. All Rights Reserved.
      </div>
    </div>
  );
}

export default LandingPage;
