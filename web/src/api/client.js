import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => client.post('/api/auth/register', data),
  login: (data) => client.post('/api/auth/login', data),
  me: () => client.get('/api/auth/me'),
};

export const tradesmensApi = {
  list: (params = {}) => client.get('/api/tradesmen', { params }),
  getById: (id) => client.get(`/api/tradesmen/${id}`),
};

export const jobsApi = {
  create: (data) => client.post('/api/jobs', data),
  mine: () => client.get('/api/jobs/mine'),
  updateStatus: (id, status) => client.patch(`/api/jobs/${id}/status`, { status }),
};
