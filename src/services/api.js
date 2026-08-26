import axios from 'axios';

// Base URLs microservices
const AUTH_URL = process.env.AUTH_URL;
const ADMIN_URL = process.env.ADMIN_URL;
const MANAGER_URL =  process.env.MANAGER_URL;

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
