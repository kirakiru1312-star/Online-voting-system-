import React from 'react';

/**
 * Displayed when a backend service is not running.
 * Keeps the page layout intact — only the affected section shows this message.
 */
const ServiceUnavailableMessage = () => (
  <div style={{
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    margin: '2rem 0'
  }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
    <p style={{ color: '#9a3412', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
      This service is temporarily unavailable at the moment. Please try again later.
    </p>
    <p style={{ color: '#c2410c', fontSize: '0.85rem', margin: 0 }}>
      The requested service is currently unavailable because the corresponding backend service is not running.
    </p>
  </div>
);

export default ServiceUnavailableMessage;
