import React from 'react';
import './ElectionCard.css';
import { Link } from 'react-router-dom';

const statusColor = { active: '#28a745', upcoming: '#ffc107', closed: '#6c757d' };

const ElectionCard = ({ election }) => (
  <div className="election-card">
    <div className="election-card-header">
      <h3>{election.title}</h3>
      <span className="badge" style={{ background: statusColor[election.status] }}>
        {election.status.toUpperCase()}
      </span>
    </div>
    <p className="election-desc">{election.description || 'No description provided.'}</p>
    <div className="election-dates">
      <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
      <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
    </div>
    <div className="election-card-actions">
      <Link to={`/elections/${election._id}`} className="btn-primary">View Details</Link>
      {election.status === 'closed' && (
        <Link to={`/results/${election._id}`} className="btn-secondary">View Results</Link>
      )}
    </div>
  </div>
);

export default ElectionCard;
