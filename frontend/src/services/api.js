import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/tickets';

export const createTicket = async (payload) => {
  const response = await axios.post(API_BASE_URL, payload);
  return response.data;
};
