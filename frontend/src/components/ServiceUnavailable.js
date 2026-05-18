import React from 'react';

/**
 * ServiceUnavailable
 * Displayed inline (inside the page content area) when a backend service
 * is not running. Layout, background, and styles of the parent page are
 * completely unaffected.
 */
const ServiceUnavailable = () => (
  <div style={{
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '12px',
    padding: '2.5rem',
    textAlign: 'center',
    margin: '2rem 0'
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
    <h3 style={{ color: '#9a3412', marginBottom: '0.75rem', fontSize: '1.25rem' }}>
      Service Temporarily Unavailable
    </h3>
    <p style={{ color: '#c2410c', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
      This service is temporarily unavailable at the moment. Please try again later.
    </p>
  </div>
);

export default ServiceUnavailable;
