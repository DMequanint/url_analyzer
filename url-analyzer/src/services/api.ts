import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const submitUrl = async (url: string) => {
  const response = await axios.post(`${API_BASE_URL}/urls`, { url });
  return response.data;
};

export const fetchUrls = async () => {
  const response = await axios.get(`${API_BASE_URL}/urls`);
  return response.data;
};

