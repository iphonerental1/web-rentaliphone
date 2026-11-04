import axios from 'axios';

/**
 * Axios instance terpusat untuk seluruh komunikasi dengan backend iRent API.
 * Base URL diambil dari environment variable VITE_API_URL.
 * Jika backend belum tersedia, aplikasi akan fallback ke mock data.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: sisipkan JWT access token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('irent_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalisasi error & handle 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('irent_access_token');
      localStorage.removeItem('irent_user');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;