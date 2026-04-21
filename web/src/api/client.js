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

export default client;

export const authApi = {
  register:         (data)   => client.post('/api/auth/register', data),
  login:            (data)   => client.post('/api/auth/login', data),
  me:               ()       => client.get('/api/auth/me'),
  updateProfile:    (data)   => client.put('/api/auth/profile', data),
  uploadAvatar:     (avatar_url) => client.put('/api/auth/profile', { avatar_url }),
  changePassword:   (data)   => client.put('/api/auth/password', data),
  topUp:            (amount) => client.post('/api/auth/topup', { amount }),
  withdraw:         (amount) => client.post('/api/auth/withdraw', { amount }),
  setPaymentMethod: (method) => client.put('/api/auth/payment-method', { payment_method: method }),
};

export const reviewsApi = {
  mine: () => client.get('/api/reviews/mine'),
};

export const tradesmensApi = {
  list:    (params = {}) => client.get('/api/tradesmen', { params }),
  getById: (id)          => client.get(`/api/tradesmen/${id}`),
};

export const jobsApi = {
  create:       (data)         => client.post('/api/jobs', data),
  mine:         ()             => client.get('/api/jobs/mine'),
  updateStatus: (id, status, extra = {}) => client.patch(`/api/jobs/${id}/status`, { status, ...extra }),
};

export const notificationsApi = {
  getAll:      () => client.get('/api/notifications'),
  markRead:    (id) => client.patch(`/api/notifications/${id}/read`),
  markAllRead: () => client.patch('/api/notifications/read-all'),
};
