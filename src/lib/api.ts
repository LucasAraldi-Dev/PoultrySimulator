import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar token expirado no futuro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout ou tentar refresh
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Redirecionar para login pode ser feito no componente ou store
    }
    return Promise.reject(error);
  }
);
