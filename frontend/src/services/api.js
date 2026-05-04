import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (username, password) => api.post('/api/login', { username, password }),
  register: (data) => api.post('/api/register', data),
  getCurrentUser: () => api.get('/api/user/me'),
  changePassword: (oldPassword, newPassword) => 
    api.put('/api/user/password', { old_password: oldPassword, new_password: newPassword }),
  updateProfile: (data) => api.put('/api/user/profile', data),
};

export const ownerAPI = {
  getHouses: () => api.get('/api/houses'),
  createHouse: (data) => api.post('/api/houses', data),
  updateHouse: (id, data) => api.put(`/api/houses/${id}`, data),
  deleteHouse: (id) => api.delete(`/api/houses/${id}`),
  
  createRepairOrder: (data) => api.post('/api/repair-orders', data),
  getRepairOrders: (status) => 
    api.get('/api/repair-orders', { params: status ? { status } : {} }),
  getRepairOrder: (id) => api.get(`/api/repair-orders/${id}`),
  cancelRepairOrder: (id) => api.put(`/api/repair-orders/${id}/cancel`),
  
  getRepairRecords: () => api.get('/api/repair-records'),
  getRepairRecord: (id) => api.get(`/api/repair-records/${id}`),
  
  createEvaluation: (data) => api.post('/api/evaluations', data),
  getEvaluations: () => api.get('/api/evaluations'),
  
  getNotices: () => api.get('/api/notices'),
  getNotice: (id) => api.get(`/api/notices/${id}`),
  
  getAmountStatistics: () => api.get('/api/statistics/amount'),
};

export const repairerAPI = {
  getPendingOrders: () => api.get('/api/repair-orders/pending'),
  acceptOrder: (id) => api.put(`/api/repair-orders/${id}/accept`),
  getMyOrders: (status) => 
    api.get('/api/repair-orders/my', { params: status ? { status } : {} }),
  completeOrder: (id, amount) => 
    api.put(`/api/repair-orders/${id}/complete`, { amount }),
  
  createRepairRecord: (data) => api.post('/api/repair-records', data),
  getMyRecords: () => api.get('/api/repair-records/my'),
  
  getMyEvaluations: () => api.get('/api/evaluations/my'),
  
  getNotices: () => api.get('/api/notices'),
  getNotice: (id) => api.get(`/api/notices/${id}`),
};

export const adminAPI = {
  getOwnerUsers: () => api.get('/api/users/owners'),
  getRepairerUsers: () => api.get('/api/users/repairers'),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getUser: (id) => api.get(`/api/users/${id}`),
  
  getRepairCategories: () => api.get('/api/repair-categories'),
  createRepairCategory: (data) => api.post('/api/repair-categories', data),
  updateRepairCategory: (id, data) => api.put(`/api/repair-categories/${id}`, data),
  deleteRepairCategory: (id) => api.delete(`/api/repair-categories/${id}`),
  
  getAllRepairOrders: (status) => 
    api.get('/api/repair-orders', { params: status ? { status } : {} }),
  updateRepairOrderStatus: (id, status) => 
    api.put(`/api/repair-orders/${id}/status`, { status }),
  deleteRepairOrder: (id) => api.delete(`/api/repair-orders/${id}`),
  
  getAllRepairRecords: () => api.get('/api/repair-records'),
  
  getAllEvaluations: () => api.get('/api/evaluations'),
  replyEvaluation: (id, reply) => 
    api.put(`/api/evaluations/${id}/reply`, { reply }),
  deleteEvaluation: (id) => api.delete(`/api/evaluations/${id}`),
  
  getAllNotices: () => api.get('/api/notices'),
  createNotice: (data) => api.post('/api/notices', data),
  updateNotice: (id, data) => api.put(`/api/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/api/notices/${id}`),
  
  getOwnerStatistics: () => api.get('/api/statistics/owners'),
  getOrderStatistics: () => api.get('/api/statistics/orders'),
  getCategoryStatistics: () => api.get('/api/statistics/categories'),
  getPerformanceStatistics: () => api.get('/api/statistics/performance'),
  getRecordStatistics: () => api.get('/api/statistics/records'),
  getDashboardStatistics: () => api.get('/api/statistics/dashboard'),
  
  createBackup: () => api.post('/api/backup'),
  getBackups: () => api.get('/api/backups'),
  deleteBackup: (name) => api.delete(`/api/backups/${name}`),
};

export const publicAPI = {
  getRepairCategories: () => api.get('/api/repair-categories'),
};
