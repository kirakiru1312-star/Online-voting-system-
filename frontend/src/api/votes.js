import api from './axios';

export const castVote = (electionId, candidateId) =>
  api.post('/votes', { electionId, candidateId });
export const checkVote = (electionId) => api.get(`/votes/check/${electionId}`);
export const getResults = (electionId) => api.get(`/results/${electionId}`);
