using System; // Placeholder for formatting, this is a TypeScript file.
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5010'; // API Gateway port

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We store the token in-memory in-app. The interceptor reads it from a helper variable.
let inMemoryToken: string | null = null;

export const setClientToken = (token: string | null) => {
  inMemoryToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (inMemoryToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Authentication Service APIs ---
export const authApi = {
  login: (data: any) => api.post('/api/auth/login', data),
  register: (data: any) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),
  changePassword: (data: any) => api.put('/api/auth/change-password', data),
  getAllUsers: () => api.get('/api/auth/users'),
  createStaff: (data: any) => api.post('/api/auth/staff', data),
};

// --- Flight Service APIs ---
export const flightApi = {
  search: (departure?: string, arrival?: string, date?: string) => {
    const params: any = {};
    if (departure) params.departure = departure;
    if (arrival) params.arrival = arrival;
    if (date) params.date = date;
    return api.get('/api/flights', { params });
  },
  getById: (id: number) => api.get(`/api/flights/${id}`),
  create: (data: any) => api.post('/api/flights', data),
  update: (id: number, data: any) => api.put(`/api/flights/${id}`, data),
  delete: (id: number) => api.delete(`/api/flights/${id}`),
};

// --- Booking Service APIs ---
export const bookingApi = {
  book: (data: any) => api.post('/api/bookings', data),
  getMyBookings: () => api.get('/api/bookings/my'),
  getById: (id: number) => api.get(`/api/bookings/${id}`),
  cancel: (id: number) => api.put(`/api/bookings/${id}/cancel`),
  getAllBookings: () => api.get('/api/bookings'),
};

// --- Notification Service APIs ---
export const notificationApi = {
  getMyNotifications: () => api.get('/api/notifications/my'),
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`),
};

// --- Gateway aggregated Stats ---
export const statsApi = {
  getStatistics: () => api.get('/api/statistics'),
};

export default api;
