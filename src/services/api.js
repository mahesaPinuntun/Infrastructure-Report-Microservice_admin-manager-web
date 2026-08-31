import axios from 'axios';

// Base URLs dari environment variables
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'https://infrastructure-repor-auth-service.vercel.app';
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || 'https://infrastructure-report-microservice-admin-service.vercel.app';
const MANAGER_URL = process.env.REACT_APP_MANAGER_URL || 'https://infrastructure-report-microservice-manager-service.vercel.app';

// Helper membuat Axios Client dengan JWT Interceptor
const createClient = (baseURL) => {
  const instance = axios.create({ baseURL });
  
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error));

  return instance;
};

// Export Client Instances
export const authApi = createClient(AUTH_URL);
export const adminApi = createClient(ADMIN_URL);
export const managerApi = createClient(MANAGER_URL);

// ----------------------------------------------------
// Dedicated Auth Services (Dedicated Endpoints)
// ----------------------------------------------------
export const loginAdmin = async (email, password) => {
  const response = await authApi.post('/api/auth/login/admin', { email, password });
  return response.data;
};

export const loginManager = async (email, password) => {
  const response = await authApi.post('/api/auth/login/manager', { email, password });
  return response.data;
};
