import api from './axios';

export const getParties = () => api.get('/parties');
export const getParty = (id) => api.get(`/parties/${id}`);
export const createParty = (data) => api.post('/parties', data);
export const updateParty = (id, data) => api.put(`/parties/${id}`, data);
export const deleteParty = (id) => api.delete(`/parties/${id}`);
