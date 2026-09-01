import axios from 'axios';

const AUTH_URL = 'https://infrastructure-report-microservice-auth-service.vercel.app';
const ADMIN_URL = 'https://infrastructure-report-microservice-admin-service.vercel.app';
const MANAGER_URL = 'https://infrastructure-report-microservice-manager-service.vercel.app';

const createClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request Interceptor: Inject Token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Auto-Logout saat 401/403 (Kecuali Rute Login)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const isLoginRoute = error.config?.url?.includes('/api/auth/login');
      
      if (error.response && (error.response.status === 401 || error.response.status === 403) && !isLoginRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
export const getTechnicians = async (page = 1, limit = 10, search = '') => {
  const response = await managerApi.get('/api/manager/technicians', {
    params: { page, limit, search }
  });
  return response.data;
};
export const authApi = createClient(AUTH_URL);
export const adminApi = createClient(ADMIN_URL);
export const managerApi = createClient(MANAGER_URL);

export const loginAdmin = async (email, password) => {
  const response = await authApi.post('/api/auth/login/admin', { email, password });
  return response.data;
};

export const loginManager = async (email, password) => {
  const response = await authApi.post('/api/auth/login/manager', { email, password });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await adminApi.post('/api/admin/users', userData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await adminApi.get('/api/admin/users');
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await adminApi.patch(`/api/admin/users/${userId}/status`, { status });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await adminApi.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
