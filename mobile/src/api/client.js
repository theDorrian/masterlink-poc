import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Auth ---
export const authApi = {
  register: (data) => client.post('/api/auth/register', data),
  login: (data) => client.post('/api/auth/login', data),
  me: () => client.get('/api/auth/me'),
};

// --- Tradesmen ---
export const tradesmensApi = {
  list: (params = {}) => client.get('/api/tradesmen', { params }),
  getById: (id) => client.get(`/api/tradesmen/${id}`),
};

// --- Jobs ---
export const jobsApi = {
  create: (data) => client.post('/api/jobs', data),
  mine: () => client.get('/api/jobs/mine'),
  updateStatus: (id, status) => client.patch(`/api/jobs/${id}/status`, { status }),
};

export default client;
