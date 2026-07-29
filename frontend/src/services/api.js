import axios from 'axios';

// Use relative /api by default so production works on the same Render host.
// Override with VITE_API_URL only when frontend and backend are on different domains.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const createTicket = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/tickets`, payload);
  return response.data;
};
