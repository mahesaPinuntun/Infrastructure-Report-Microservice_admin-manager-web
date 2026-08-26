import axios from 'axios';

// Base URLs microservices
const AUTH_URL = 'http://localhost:8001/api/auth';
const ADMIN_URL = 'http://localhost:8002/api/admin';
const MANAGER_URL = 'http://localhost:8003/api/manager';

// Helper membuat Axios Client dengan JWT Interceptor (#6 Enforce server side auth)
const createClient = (baseURL) => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
};

export const authApi = createClient(AUTH_URL);
export const adminApi = createClient(ADMIN_URL);
export const managerApi = createClient(MANAGER_URL);