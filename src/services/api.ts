import axios from 'axios';

// Create an axios instance with the backend base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;