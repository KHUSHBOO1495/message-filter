import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createTicket = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/tickets`, payload);
  return response.data;
};
