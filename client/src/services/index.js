import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getAllUsers: (params) => api.get('/auth/users', { params }),
};

export const menuService = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  getStats: () => api.get('/orders/stats'),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const reservationService = {
  create: (data) => api.post('/reservations', data),
  lookup: (code) => api.get(`/reservations/lookup/${code}`),
  getMyReservations: () => api.get('/reservations/my'),
  getAll: (params) => api.get('/reservations', { params }),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  cancel: (id) => api.delete(`/reservations/${id}`),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getByMenuItem: (menuItemId) => api.get(`/reviews/${menuItemId}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getAll: () => api.get('/reviews/all'),
};

export const contactService = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  update: (id, data) => api.put(`/contact/${id}`, data),
  delete: (id) => api.delete(`/contact/${id}`),
};
