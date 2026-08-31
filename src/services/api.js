import axios from 'axios';

// Base URLs microservices langsung menunjuk ke domain Vercel yang valid
const AUTH_URL = 'https://infrastructure-report-microservice-auth.vercel.app';
const ADMIN_URL = 'https://infrastructure-report-microservice-admin-service.vercel.app';
const MANAGER_URL = 'https://infrastructure-report-microservice-manager-service.vercel.app';

// Helper untuk membuat Axios Client Instance dengan Request Interceptor (JWT Token)
const createClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor: Menyisipkan Bearer Token dari LocalStorage pada setiap Request
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

// Export Client Instances per Microservice
export const authApi = createClient(AUTH_URL);
export const adminApi = createClient(ADMIN_URL);
export const managerApi = createClient(MANAGER_URL);

// ----------------------------------------------------
// Dedicated Auth Helper Methods (Endpoint Login Per Role)
// ----------------------------------------------------

/**
 * Login khusus Admin System
 * Endpoint: POST /api/auth/login/admin
 */
export const loginAdmin = async (email, password) => {
  const response = await authApi.post('/api/auth/login/admin', { email, password });
  return response.data;
};

/**
 * Login khusus Manager Lapangan
 * Endpoint: POST /api/auth/login/manager
 */
export const loginManager = async (email, password) => {
  const response = await authApi.post('/api/auth/login/manager', { email, password });
  return response.data;
};
