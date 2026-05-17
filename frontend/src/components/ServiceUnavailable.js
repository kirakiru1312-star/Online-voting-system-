import React from 'react';

/**
 * Displayed when a backend service is not running.
 * Satisfies the distributed system graceful degradation requirement.
 */
const ServiceUnavailable = ({ message }) => (
  <div style={{
    margin: '2rem 0',
    padding: '2rem',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '12px',
    borderLeft: '4px solid #f97316',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  }}>
    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
    <div>
      <p style={{ margin: 0, fontWeight: 700, color: '#9a3412', fontSize: '1rem' }}>
        {message || 'This service is temporarily unavailable at the moment. Please try again later.'}
      </p>
    </div>
  </div>
);

export default ServiceUnavailable;
