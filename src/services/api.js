import axios from 'axios';

// URL Microservices (Hardcoded ke domain Vercel yang aktif)
const AUTH_URL = 'https://infrastructure-report-microservice-auth-service.vercel.app';
const ADMIN_URL = 'https://infrastructure-report-microservice-admin-service.vercel.app';
const MANAGER_URL = 'https://infrastructure-report-microservice-manager-service.vercel.app';

const createClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

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

  return instance;
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
